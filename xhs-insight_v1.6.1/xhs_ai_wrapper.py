# -*- coding: utf-8 -*-
"""
@File    : xhs_ai_wrapper.py
@Description : 小红书爬虫通用接口（运行时路径自动纠正版 - Lazy Import）
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
            logger.warning(f"⚠️ Warning: {env_path} not found.")
        
        # We DO NOT instantiate the API class here to avoid triggering top-level execution
        # of the spider's dependencies (like execjs) during module import.
        # The instantiation happens lazily in the methods.
        self.api_instance = None
        logger.info(f"✅ 爬虫 Wrapper 初始化完成 (Lazy Mode)")

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
            # 切换到爬虫目录，这样 read('./static/xxx.js') 才能找到文件
            os.chdir(self.spider_path)
            yield
        finally:
            # 无论是否报错，都要切回来，保证程序稳健
            os.chdir(original_cwd)

    def _get_api(self):
        """ Lazy Loader for API Instance """
        if self.api_instance:
            return self.api_instance
            
        # Import happens HERE, inside the directory context
        with self._spider_context():
            try:
                from apis.xhs_pc_apis import XHS_Apis
                self.api_instance = XHS_Apis()
                return self.api_instance
            except ImportError as e:
                logger.error(f"❌ Failed to import XHS_Apis: {e}")
                raise e
            except Exception as e:
                logger.error(f"❌ Failed to initialize XHS_Apis: {e}")
                raise e

    def search_notes(self, keyword: str, limit: int = 10, sort_type: int = 0) -> dict:
        """ 搜索笔记 """
        if not self.spider_path: return self._fail("爬虫目录未找到")

        with self._spider_context():
            try:
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
                return self._fail(str(e))

    def get_note_detail(self, note_url: str, cookie: str = None) -> dict:
        """ 获取单篇笔记详情 """
        if not self.spider_path: return self._fail("爬虫目录未找到")
        
        use_cookie = cookie if cookie else self.cookie

        with self._spider_context():
            try:
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
                return result # Direct return for service use
            except Exception as e:
                logger.error(f"Error in get_note_detail: {e}")
                raise e

    def _success(self, data, type_name):
        return {"status": "success", "type": type_name, "data": data}

    def _fail(self, msg):
        return {"status": "error", "message": str(msg)}
