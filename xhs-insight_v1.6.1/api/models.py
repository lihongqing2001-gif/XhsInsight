from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean, JSON
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    gemini_api_key = Column(String, nullable=True)
    
    cookies = relationship("Cookie", back_populates="owner")
    groups = relationship("AnalysisGroup", back_populates="owner")
    results = relationship("ScrapeResult", back_populates="owner")

class Cookie(Base):
    __tablename__ = "cookies"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    value = Column(Text, nullable=False)
    note = Column(String, nullable=True)
    is_valid = Column(Boolean, default=True)
    failure_count = Column(Integer, default=0)
    last_used = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", back_populates="cookies")

class AnalysisGroup(Base):
    __tablename__ = "analysis_groups"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    
    owner = relationship("User", back_populates="groups")
    results = relationship("ScrapeResult", back_populates="group")

class ScrapeResult(Base):
    __tablename__ = "scrape_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    group_id = Column(Integer, ForeignKey("analysis_groups.id"), nullable=True)
    
    # Original Data
    original_url = Column(String)
    title = Column(String)
    content = Column(Text)
    cover_image = Column(String)
    author_json = Column(JSON) # Store name, avatar, followers
    stats_json = Column(JSON) # likes, collects, comments
    
    # AI Analysis
    ai_viral_reasons = Column(JSON) # List of strings
    ai_improvements = Column(JSON)
    ai_psychology = Column(Text)
    ai_rewrite = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", back_populates="results")
    group = relationship("AnalysisGroup", back_populates="results")