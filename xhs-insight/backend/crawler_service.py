import random
from sqlalchemy.orm import Session
from .models import Cookie, CookieStatus, ScrapeResult
import datetime

# Mock import for the external Spider tool
# In production: from Spider_XHS_master import xhs_crawler
class MockSpiderWrapper:
    def get_note_data(self, url, cookie_value):
        # This calls the actual Python script in Spider_XHS-master
        # Returning mock data for structure example
        if "fail" in url:
            raise Exception("401 Unauthorized")
        return {
            "title": "Example Viral Note",
            "content": "This is the content...",
            "stats": {"likes": 1200, "collects": 400, "comments": 50},
            "images": ["https://picsum.photos/400/400"]
        }

spider = MockSpiderWrapper()

class CrawlerManager:
    def __init__(self, db: Session):
        self.db = db

    def get_valid_cookie(self, user_id: int):
        """
        Round-robin or random selection of an active cookie for the user.
        """
        cookies = self.db.query(Cookie).filter(
            Cookie.user_id == user_id, 
            Cookie.status == CookieStatus.ACTIVE
        ).all()
        
        if not cookies:
            raise Exception("COOKIE_DEPLETED")
            
        # Simple random load balancing
        selected = random.choice(cookies)
        selected.last_used = datetime.datetime.utcnow()
        self.db.commit()
        return selected

    def handle_scrape(self, user_id: int, url: str):
        try:
            cookie = self.get_valid_cookie(user_id)
        except Exception as e:
            return {"error": "Please add valid cookies to proceed.", "code": "COOKIE_DEPLETED"}

        try:
            data = spider.get_note_data(url, cookie.value)
            # Reset failure count on success
            cookie.failure_count = 0
            self.db.commit()
            return data
        except Exception as e:
            if "401" in str(e) or "Unauthorized" in str(e):
                # Circuit breaker logic
                cookie.failure_count += 1
                if cookie.failure_count >= 3:
                    cookie.status = CookieStatus.INVALID
                self.db.commit()
                
                # Retry recursively with a different cookie
                return self.handle_scrape(user_id, url)
            else:
                raise e
