# -*- coding: utf-8 -*-
"""
@File    : xhs_ai_wrapper.py
@Description : 小红书爬虫通用接口（运行时路径自动纠正版）
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
    sys.path.append(spider_root_path)
    logger.remove()
    logger.add(sys.stderr, level="INFO")
    
    # 导入时的临时跳转（为了加载模块）
    original_cwd = os.getcwd()
    try:
        os.chdir(spider_root_path)
        from apis.xhs_pc_apis import XHS_Apis
        logger.info(f"✅ 成功从 {spider_root_path} 加载核心模块")
    except ImportError as e:
        logger.error(f"❌ 导入失败: {e}")
        os.chdir(original_cwd)
        sys.exit(1)
    finally:
        os.chdir(original_cwd)
else:
    logger.error("❌ 未找到爬虫文件夹！")
    sys.exit(1)
# ===============================================

class XHS_Wrapper:
    def __init__(self):
        """ 初始化：从爬虫文件夹内部加载 .env Cookie """
        self.spider_path = spider_root_path
        env_path = os.path.join(self.spider_path, ".env")
        
        if not os.path.exists(env_path):
            raise FileNotFoundError(f"❌ 未找到配置文件: {env_path}")
            
        load_dotenv(env_path, override=True)
        self.cookie = os.getenv("COOKIES")
        
        if not self.cookie:
            raise ValueError(f"❌ {env_path} 中未找到 'COOKIES' 变量")

        # 初始化 API
        # 这里也要用上下文管理器，防止初始化时读取文件报错
        with self._spider_context():
            self.api = XHS_Apis()
            
        logger.info(f"✅ 爬虫服务初始化成功")

    @contextmanager
    def _spider_context(self):
        """
        【核心修复】上下文管理器：
        在执行代码块前，自动跳进爬虫目录；
        执行完后，自动跳回原目录。
        """
        original_cwd = os.getcwd()
        try:
            # 切换到爬虫目录，这样 read('./static/xxx.js') 才能找到文件
            os.chdir(self.spider_path)
            yield
        finally:
            # 无论是否报错，都要切回来，保证程序稳健
            os.chdir(original_cwd)

    def search_notes(self, keyword: str, limit: int = 10, sort_type: int = 0) -> dict:
        """ 搜索笔记 """
        # 使用 with 语句包裹，运行时自动切换目录
        with self._spider_context():
            try:
                success, msg, notes_raw = self.api.search_some_note(
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

    def get_note_detail(self, note_url: str) -> dict:
        """ 获取单篇笔记详情 """
        # 使用 with 语句包裹
        with self._spider_context():
            try:
                success, msg, res = self.api.get_note_info(note_url, self.cookie)
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
                    "stats": note.get('interact_info'),
                    "images": images
                }
                return self._success(result, "note_detail")
            except Exception as e:
                return self._fail(str(e))

    def _success(self, data, type_name):
        return {"status": "success", "type": type_name, "data": data}

    def _fail(self, msg):
        return {"status": "error", "message": str(msg)}
