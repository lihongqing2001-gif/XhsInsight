import os
import sys
import random
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from .models import Cookie

# Add the root directory to path to import the provided wrapper
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Mocking the import if file doesn't exist during code generation check
try:
    from Spider_XHS_master import xhs_ai_wrapper
except ImportError:
    print("Warning: Spider_XHS_master not found. Using mock wrapper.")
    class MockWrapper:
        def get_note_detail(self, url, cookie):
            if "invalid" in cookie: raise Exception("401 Unauthorized")
            return {
                "title": "测试笔记标题 (Mock)", 
                "desc": "这是一个模拟的笔记内容，用于演示系统功能...",
                "images_list": ["https://picsum.photos/400/600"],
                "likes": 100, "collected": 50, "comments": 10,
                "user": {"nickname": "测试用户", "avatar": "https://picsum.photos/50/50", "userid": "123"}
            }
    xhs_ai_wrapper = MockWrapper()

def get_valid_cookie(db: Session, user_id: int):
    """
    Round-robin selection of valid cookies for a user.
    Orders by last_used to ensure even distribution.
    """
    cookie = db.query(Cookie).filter(
        Cookie.user_id == user_id,
        Cookie.is_valid == True
    ).order_by(Cookie.last_used.asc()).first()
    
    if not cookie:
        raise Exception("COOKIE_EXHAUSTED")
        
    # Update last used
    cookie.last_used = datetime.utcnow()
    db.commit()
    return cookie

def fetch_xhs_data(db: Session, user_id: Optional[int], url: str, manual_cookie: Optional[str] = None):
    """
    Attempts to fetch data. 
    If manual_cookie is provided (Local Mode), skips DB lookup.
    If user_id is provided, uses DB cookies with rotation and retry logic.
    """
    
    # --- Local Mode Path ---
    if manual_cookie:
        try:
            data = xhs_ai_wrapper.get_note_detail(url, manual_cookie)
            return data
        except Exception as e:
            # In local mode, we just raise the error directly
            raise Exception(f"爬取失败: {str(e)}")

    # --- DB User Path ---
    max_retries = 3
    attempt = 0
    
    while attempt < max_retries:
        try:
            cookie_obj = get_valid_cookie(db, user_id)
        except Exception as e:
            raise e # No cookies left
            
        try:
            # Call the provided wrapper
            data = xhs_ai_wrapper.get_note_detail(url, cookie_obj.value)
            return data
            
        except Exception as e:
            error_msg = str(e)
            if "401" in error_msg or "Unauthorized" in error_msg:
                # Mark invalid
                cookie_obj.is_valid = False
                cookie_obj.failure_count += 1
                db.commit()
                attempt += 1
                continue # Retry loop
            else:
                raise e # Other network error
                
    raise Exception("Max retries exceeded or all cookies failed.")
