# -*- coding: utf-8 -*-
import os
import requests
import uuid

# 1. 确定图片保存的绝对路径
# 获取 utils.py 所在的文件夹
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# 拼接 static/images 路径
IMAGE_DIR = os.path.join(BASE_DIR, "static", "images")

# 自动创建目录
if not os.path.exists(IMAGE_DIR):
    os.makedirs(IMAGE_DIR)

def download_image(image_url):
    """
    下载网络图片到本地
    返回: 本地保存的相对路径 (例如: static/images/xxx.jpg)
    """
    if not image_url:
        return None

    # 如果已经是本地路径，直接返回
    if not image_url.startswith("http"):
        return image_url

    try:
        # 伪装 Header 防止被拦截
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        
        # 发送请求
        response = requests.get(image_url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            # 生成随机文件名
            file_name = f"{uuid.uuid4().hex}.jpg"
            save_path = os.path.join(IMAGE_DIR, file_name)
            
            # 写入文件
            with open(save_path, "wb") as f:
                f.write(response.content)
            
            # 返回相对路径供网页显示
            return f"static/images/{file_name}"
            
    except Exception as e:
        print(f"❌ 图片下载失败: {e}")
        return None
    
    return None
