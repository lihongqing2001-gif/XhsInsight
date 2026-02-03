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

# Import the wrapper from the root directory
try:
    import xhs_ai_wrapper
    print("Successfully imported xhs_ai_wrapper from root")
except ImportError as e:
    print(f"Warning: Could not import xhs_ai_wrapper. Error: {e}")
    print(f"Current sys.path: {sys.path}")
    
    # Mock Wrapper for build time or if file is missing during dev
    class MockWrapper:
        def get_note_detail(self, url, cookie):
            if cookie and "invalid" in cookie: raise Exception("401 Unauthorized")
            return {
                "title": "测试笔记 (Mock Data)", 
                "desc": "无法加载 xhs_ai_wrapper.py。请确保该文件位于项目根目录，并且 Spider_XHS-master 文件夹存在。",
                "images_list": ["https://picsum.photos/400/600"],
                "likes": 999, "collected": 888, "comments": 777,
                "user": {"nickname": "系统提示", "avatar": "", "userid": "0"}
            }
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
    """
    
    # --- Local Mode / Direct Test ---
    if manual_cookie or (not user_id):
        try:
            # Use manual cookie or a placeholder if testing connectivity
            data = xhs_ai_wrapper.get_note_detail(url, manual_cookie or "demo_cookie")
            return data
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
            data = xhs_ai_wrapper.get_note_detail(url, cookie_obj.value)
            return data
            
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