# -*- coding: utf-8 -*-
"""
@File    : xhs_ai_wrapper.py
@Description : 小红书爬虫通用接口（运行时路径自动纠正版 - Lazy Import + Runtime Check）
"""
import sys
import os
from loguru import logger
from dotenv import load_dotenv
from contextlib import contextmanager

# ================= 动态路径加载 =================
base_dir = os.path.dirname(os.path.abspath(__file__))
possible_spider_names = ["Spider_XHS", "Spider_XHS-master", "Spider"]
spider_root_path = None

for name in possible_spider_names:
    p = os.path.join(base_dir, name)
    if os.path.exists(p) and os.path.exists(os.path.join(p, "apis")):
        spider_root_path = p
        break

if spider_root_path:
    # Add spider path to sys.path so we can import its modules later
    if spider_root_path not in sys.path:
        sys.path.append(spider_root_path)
else:
    logger.warning("❌ 未找到爬虫文件夹！将无法使用真实爬虫功能。")

# ===============================================

class XHS_Wrapper:
    def __init__(self):
        """ 初始化：从爬虫文件夹内部加载 .env Cookie """
        self.spider_path = spider_root_path
        self.js_runtime_available = True  # Assume true initially
        
        if not self.spider_path:
             logger.error("Spider path not set. Wrapper initialized in broken state.")
             self.cookie = None
             return

        env_path = os.path.join(self.spider_path, ".env")
        
        # Load Env
        if os.path.exists(env_path):
            load_dotenv(env_path, override=True)
            self.cookie = os.getenv("COOKIES")
        else:
            self.cookie = None
        
        self.api_instance = None
        # Check ExecJS early
        self._check_js_runtime()
        logger.info(f"✅ 爬虫 Wrapper 初始化完成 (Runtime Available: {self.js_runtime_available})")

    def _check_js_runtime(self):
        """Pre-check if a JS runtime (Node.js) is available."""
        try:
            import execjs
            # Attempt to locate a runtime. 
            # execjs.get() throws RuntimeUnavailableError if no runtime is found.
            # On some systems, it might default to JScript (Windows) which often fails for complex JS.
            runtime = execjs.get() 
            if not runtime:
                raise Exception("No JS Runtime found")
            
            # Try a simple compilation
            ctx = execjs.compile("function test() { return 1+1; }")
            if ctx.call("test") != 2:
                raise Exception("JS Execution Verification Failed")
                
        except Exception as e:
            self.js_runtime_available = False
            logger.warning(f"⚠️ JS Runtime Check Failed: {e}. Crawler will not work. System will use Mock Mode.")

    @contextmanager
    def _spider_context(self):
        """
        【核心修复】上下文管理器：
        在执行代码块前，自动跳进爬虫目录；
        执行完后，自动跳回原目录。
        """
        if not self.spider_path:
            yield
            return

        original_cwd = os.getcwd()
        try:
            os.chdir(self.spider_path)
            yield
        finally:
            os.chdir(original_cwd)

    def _get_api(self):
        """ Lazy Loader for API Instance """
        if not self.js_runtime_available:
            # Raise specific error that our service layer looks for
            raise RuntimeError("RuntimeUnavailableError: Missing Node.js")

        if self.api_instance:
            return self.api_instance
            
        with self._spider_context():
            try:
                from apis.xhs_pc_apis import XHS_Apis
                self.api_instance = XHS_Apis()
                return self.api_instance
            except ImportError as e:
                logger.error(f"❌ Failed to import XHS_Apis: {e}")
                # Mark runtime as unavailable if import fails likely due to js deps
                self.js_runtime_available = False
                raise RuntimeError(f"RuntimeUnavailableError: {str(e)}")
            except Exception as e:
                logger.error(f"❌ Failed to initialize XHS_Apis: {e}")
                self.js_runtime_available = False
                raise RuntimeError(f"RuntimeUnavailableError: {str(e)}")

    def search_notes(self, keyword: str, limit: int = 10, sort_type: int = 0) -> dict:
        """ 搜索笔记 """
        if not self.spider_path: return self._fail("爬虫目录未找到")
        
        try:
            with self._spider_context():
                api = self._get_api()
                success, msg, notes_raw = api.search_some_note(
                    keyword, limit, self.cookie, sort_type, 
                    0, 0, 0, 0, None, None
                )
                
                if not success:
                    return self._fail(msg)

                clean_notes = []
                for note in notes_raw:
                    if note.get('model_type') == 'note':
                        clean_notes.append({
                            "id": note.get('id'),
                            "title": note.get('title', '无标题'),
                            "link": f"https://www.xiaohongshu.com/explore/{note.get('id')}?xsec_token={note.get('xsec_token','')}",
                            "likes": note.get('liked_count', 0),
                            "user": note.get('user', {}).get('nickname', '')
                        })
                return self._success(clean_notes, "search_result")
        except Exception as e:
            # Let service layer handle "RuntimeUnavailableError"
            raise e

    def get_note_detail(self, note_url: str, cookie: str = None) -> dict:
        """ 获取单篇笔记详情 """
        if not self.spider_path: return self._fail("爬虫目录未找到")
        
        use_cookie = cookie if cookie else self.cookie

        try:
            with self._spider_context():
                api = self._get_api()
                success, msg, res = api.get_note_info(note_url, use_cookie)
                if not success:
                    return self._fail(msg)

                data = res.get('data', {})
                items = data.get('items', [data])
                if not items: return self._fail("无数据")
                
                note = items[0].get('note_card', items[0])
                
                images = []
                for img in note.get('image_list', []):
                    if img.get('info_list'):
                        url = img['info_list'][0].get('url', '')
                        if url.startswith('//'): url = 'https:' + url
                        images.append(url)

                result = {
                    "title": note.get('title'),
                    "desc": note.get('desc'),
                    "images_list": images,
                    "likes": note.get('interact_info', {}).get('liked_count', 0),
                    "collected": note.get('interact_info', {}).get('collected_count', 0),
                    "comments": note.get('interact_info', {}).get('comment_count', 0),
                    "user": note.get('user', {})
                }
                return result 
        except Exception as e:
            # Ensure exception propagates so service layer can catch it and switch to mock
            raise e

    def _success(self, data, type_name):
        return {"status": "success", "type": type_name, "data": data}

    def _fail(self, msg):
        return {"status": "error", "message": str(msg)}
