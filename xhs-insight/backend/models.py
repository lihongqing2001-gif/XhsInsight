from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import enum
import datetime

Base = declarative_base()

class CookieStatus(enum.Enum):
    ACTIVE = "Active"
    INVALID = "Invalid"
    EXPIRED = "Expired"

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    password_hash = Column(String(100))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    cookies = relationship("Cookie", back_populates="owner")
    groups = relationship("AnalysisGroup", back_populates="owner")

class Cookie(Base):
    __tablename__ = 'cookies'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    value = Column(Text, nullable=False)
    status = Column(Enum(CookieStatus), default=CookieStatus.ACTIVE)
    failure_count = Column(Integer, default=0)
    last_used = Column(DateTime, nullable=True)
    
    owner = relationship("User", back_populates="cookies")

class AnalysisGroup(Base):
    __tablename__ = 'analysis_groups'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    name = Column(String(100), nullable=False)
    
    notes = relationship("ScrapeResult", back_populates="group")
    owner = relationship("User", back_populates="groups")

class ScrapeResult(Base):
    __tablename__ = 'scrape_results'
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey('analysis_groups.id'))
    original_url = Column(String(500), index=True)
    title = Column(String(255))
    content = Column(Text)
    author_info = Column(JSON) # e.g. {fans: 1000, name: "xyz"}
    stats = Column(JSON) # e.g. {likes: 10, comments: 2}
    media_urls = Column(JSON) # List of image/video URLs
    
    # Gemini Analysis Results
    analysis_json = Column(JSON) 
    
    crawled_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    group = relationship("AnalysisGroup", back_populates="notes")
