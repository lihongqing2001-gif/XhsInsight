import os
import sys
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from .models import Cookie

# Critical for Vercel: Add the project root directory to sys.path
# This allows importing 'xhs_ai_wrapper' which resides in the root
current_dir = os.path.dirname(__file__)
root_dir = os.path.abspath(os.path.join(current_dir, '..'))
if root_dir not in sys.path:
    sys.path.append(root_dir)

# --- Wrapper Loading Logic ---
xhs_ai_wrapper = None
WRAPPER_ERROR = None

class MockWrapper:
    """
    Fallback wrapper used when the real crawler cannot run 
    (e.g., missing Node.js runtime for JS signature generation).
    """
    def get_note_detail(self, url, cookie):
        # Simulate unauthorized if cookie is explicitly invalid
        if cookie and "invalid" in cookie: 
            raise Exception("401 Unauthorized")
            
        return {
            "title": "测试笔记 (Mock Data / 环境限制)", 
            "desc": f"【系统提示】\n检测到当前运行环境（如 Vercel Serverless）缺少 Node.js 运行时，导致爬虫无法执行 JavaScript 签名。\n\n系统已自动切换至演示模式。\n\n若需使用真实爬虫功能，请在本地环境运行，或部署至支持 Docker/Node.js 的服务器。",
            "images_list": ["https://picsum.photos/400/600"],
            "likes": 1234, 
            "collected": 567, 
            "comments": 89,
            "user": {"nickname": "系统提示", "avatar": "https://picsum.photos/50/50", "userid": "0"}
        }

try:
    # Attempt to import
    import xhs_ai_wrapper as wrapper_module
    xhs_ai_wrapper = wrapper_module.XHS_Wrapper()
    print("✅ Successfully initialized xhs_ai_wrapper")
except Exception as e:
    WRAPPER_ERROR = str(e)
    print(f"⚠️ Warning: Could not import or initialize xhs_ai_wrapper.\nError: {e}")
    xhs_ai_wrapper = MockWrapper()


def get_valid_cookie(db: Session, user_id: int):
    """
    Round-robin selection of valid cookies for a user.
    """
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
    Attempts to fetch data using the root xhs_ai_wrapper.
    Handles 'RuntimeUnavailableError' (missing Node.js) by falling back to Mock data.
    """
    
    def _safe_fetch(cookie_val):
        try:
            return xhs_ai_wrapper.get_note_detail(url, cookie_val)
        except Exception as e:
            error_msg = str(e)
            # Catch ExecJS runtime error (missing Node.js)
            if "JavaScript runtime" in error_msg or "RuntimeUnavailableError" in error_msg:
                print(f"⚠️ Runtime missing (ExecJS). Falling back to Mock.")
                return MockWrapper().get_note_detail(url, cookie_val)
            raise e

    # --- Local Mode / Direct Test ---
    if manual_cookie or (not user_id):
        try:
            # Use manual cookie or a placeholder if testing connectivity
            return _safe_fetch(manual_cookie or "demo_cookie")
        except Exception as e:
            raise Exception(f"爬取失败: {str(e)}")

    # --- DB User Path (Rotation) ---
    max_retries = 3
    attempt = 0
    
    while attempt < max_retries:
        try:
            cookie_obj = get_valid_cookie(db, user_id)
        except Exception as e:
            raise e # No cookies left
            
        try:
            return _safe_fetch(cookie_obj.value)
            
        except Exception as e:
            error_msg = str(e)
            if "401" in error_msg or "Unauthorized" in error_msg:
                cookie_obj.is_valid = False
                cookie_obj.failure_count += 1
                db.commit()
                attempt += 1
                continue
            else:
                raise e
                
    raise Exception("Max retries exceeded or all cookies failed.")
