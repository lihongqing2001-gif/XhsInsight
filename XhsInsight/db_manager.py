# -*- coding: utf-8 -*-
import sqlite3
import datetime
import os

# 获取当前目录，确保数据库生成在项目文件夹里
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_NAME = os.path.join(BASE_DIR, "xhs_history.db")

def init_db():
    """初始化数据库表"""
    try:
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        # 创建表：包含用户ID、链接、标题、本地封面路径、点赞、评论、AI分析、时间
        c.execute('''CREATE TABLE IF NOT EXISTS history
                     (id INTEGER PRIMARY KEY AUTOINCREMENT,
                      user_id TEXT,
                      url TEXT,
                      title TEXT,
                      cover_path TEXT,
                      likes INTEGER,
                      comments INTEGER,
                      ai_analysis TEXT,
                      created_at TEXT)''')
        conn.commit()
    except Exception as e:
        print(f"❌ 数据库初始化失败: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

def save_analysis(user_id, data):
    """保存一条记录"""
    try:
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        
        # 获取当前时间
        current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        c.execute('''INSERT INTO history 
                     (user_id, url, title, cover_path, likes, comments, ai_analysis, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
                  (user_id,
                   data.get('url'),
                   data.get('title'),
                   data.get('local_cover'), # 重点：存的是本地路径
                   data.get('likes', 0),
                   data.get('comments_count', 0),
                   data.get('ai_analysis', '暂无分析'),
                   current_time))
        conn.commit()
    except Exception as e:
        print(f"❌ 数据保存失败: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

def get_history_by_user(user_id):
    """读取某人的历史记录"""
    results = []
    try:
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        # 按时间倒序查询
        c.execute("SELECT * FROM history WHERE user_id=? ORDER BY created_at DESC", (user_id,))
        rows = c.fetchall()
        
        keys = ['id', 'user_id', 'url', 'title', 'cover_path', 'likes', 'comments', 'ai_analysis', 'created_at']
        for row in rows:
            results.append(dict(zip(keys, row)))
            
    except Exception as e:
        print(f"❌ 读取历史失败: {e}")
    finally:
        if 'conn' in locals():
            conn.close()
            
    return results
