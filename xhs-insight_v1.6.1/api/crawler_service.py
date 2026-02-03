import os
import sys
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from .models import Cookie

# --- Lazy Wrapper Initialization ---
# We do NOT import xhs_ai_wrapper at the top level to avoid ImportError 
# if the environment (like Vercel) is restrictive or file paths are complex.

_crawler_instance = None
_MockWrapperClass = None

def _get_mock_wrapper():
    global _MockWrapperClass
    if _MockWrapperClass:
        return _MockWrapperClass()
        
    class MockWrapper:
        def get_note_detail(self, url, cookie):
            # Simulate 401 if specifically requested via cookie note
            if cookie and "invalid" in cookie: 
                raise Exception("401 Unauthorized")
            
            return {
                "title": "测试笔记 (环境限制/Mock模式)", 
                "desc": f"【系统提示】\n检测到当前服务器环境无法运行 JavaScript (缺少 Node.js)，已自动切换至演示模式。\n\n请求URL: {url}\n\n这通常发生在 Vercel 等 Serverless 环境中。如需真实抓取，请在本地使用 Docker 或安装 Node.js 后运行。",
                "images_list": ["https://picsum.photos/400/600", "https://picsum.photos/400/601"],
                "likes": 1234, "collected": 567, "comments": 89,
                "user": {"nickname": "系统演示账号", "avatar": "https://picsum.photos/50/50", "userid": "0"}
            }
    _MockWrapperClass = MockWrapper
    return MockWrapper()

def _get_crawler():
    global _crawler_instance
    if _crawler_instance:
        return _crawler_instance

    try:
        # Add root directory to sys.path dynamically
        current_dir = os.path.dirname(__file__)
        root_dir = os.path.abspath(os.path.join(current_dir, '..'))
        if root_dir not in sys.path:
            sys.path.append(root_dir)
        
        # Attempt Import
        import xhs_ai_wrapper
        _crawler_instance = xhs_ai_wrapper.XHS_Wrapper()
        print("✅ Crawler initialized successfully via Lazy Load.")
        
    except Exception as e:
        print(f"⚠️ Crawler initialization failed: {e}. Switching to Mock.")
        _crawler_instance = _get_mock_wrapper()
        
    return _crawler_instance

def get_valid_cookie(db: Session, user_id: int):
    cookie = db.query(Cookie).filter(
        Cookie.user_id == user_id,
        Cookie.is_valid == True
    ).order_by(Cookie.last_used.asc()).first()
    
    if not cookie:
        raise Exception("COOKIE_EXHAUSTED")
        
    cookie.last_used = datetime.utcnow()
    db.commit()
    return cookie

def fetch_xhs_data(db: Session, user_id: Optional[int], url: str, manual_cookie: Optional[str] = None):
    """
    Fetches data using the lazy-loaded crawler instance with robust fallback.
    """
    crawler = _get_crawler()
    mock_crawler = _get_mock_wrapper()

    def safe_crawl(target_url, cookie_val):
        """Attempts crawl, falls back to mock if JS runtime is missing."""
        try:
            return crawler.get_note_detail(target_url, cookie_val)
        except Exception as e:
            err_msg = str(e)
            # Detect Missing Node.js / ExecJS errors
            if any(x in err_msg for x in ["JavaScript runtime", "RuntimeUnavailable", "Program", "execjs", "node"]):
                print(f"⚠️ Runtime Error ({err_msg}). Falling back to Mock Data.")
                return mock_crawler.get_note_detail(target_url, "mock_fallback")
            raise e

    # 1. Local Mode / Manual Cookie
    if manual_cookie or (not user_id):
        try:
            return safe_crawl(url, manual_cookie or "demo_cookie")
        except Exception as e:
            raise Exception(f"爬取失败: {str(e)}")

    # 2. Database User Mode (with Retry & Rotation)
    max_retries = 3
    attempt = 0
    
    while attempt < max_retries:
        try:
            cookie_obj = get_valid_cookie(db, user_id)
        except Exception as e:
            raise e # No cookies left
            
        try:
            return safe_crawl(url, cookie_obj.value)
        except Exception as e:
            error_msg = str(e)
            if "401" in error_msg or "Unauthorized" in error_msg:
                print(f"Cookie {cookie_obj.id} expired. Rotating...")
                cookie_obj.is_valid = False
                cookie_obj.failure_count += 1
                db.commit()
                attempt += 1
                continue
            else:
                raise e # Real network/parsing error
                
    raise Exception("Max retries exceeded or all cookies failed.")
