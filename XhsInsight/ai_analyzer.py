# -*- coding: utf-8 -*-
from google import genai
import os

# ================= 配置区域 =================
# ⚠️ 请填入你的 Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "在此处填入你的Key") 
# ===========================================

def analyze_content(title, desc, comments):
    """
    使用 Google Gemini (新版 SDK) 分析内容受欢迎的原因
    """
    try:
        # 1. 初始化客户端
        client = genai.Client(api_key=GEMINI_API_KEY)

        # 2. 构建提示词
        prompt = f"""
        你是一个资深的社交媒体运营专家。请分析以下小红书笔记为何受欢迎。

        【笔记信息】
        - 标题：{title}
        - 正文摘要：{desc[:500]}...
        - 热门评论：{comments}

        【分析要求】
        1. 简练地总结爆款原因（100字以内）。
        2. 分析用户的核心情绪。
        3. 直接输出分析结果，不要有多余的客套话。
        """

        # 3. 调用模型生成内容 (注意这里的语法变化)
        response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=prompt
        )
        
        # 4. 返回结果
        return response.text
        
    except Exception as e:
        print(f"Gemini API 调用出错: {e}")
        return "AI 分析暂时不可用，请检查网络或 API Key。"

if __name__ == "__main__":
    # 本地测试
    print(analyze_content("测试标题", "测试内容", "测试评论"))
