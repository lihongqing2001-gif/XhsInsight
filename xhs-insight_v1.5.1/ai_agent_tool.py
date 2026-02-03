# -*- coding: utf-8 -*-
from xhs_ai_wrapper import XHS_Wrapper
import json

def xhs_tool(action: str, query: str):
    """
    AI 专用的小红书工具函数
    
    :param action: 指令类型，可选 "search" (搜索笔记) 或 "detail" (获取详情)
    :param query:  如果是 search，填搜索关键词；如果是 detail，填笔记链接
    :return: 结构化的 JSON 字典
    """
    print(f"🤖 AI正在执行任务: [{action}] -> {query}")
    
    try:
        # 1. 初始化
        # 核心逻辑：自动寻找 Spider_XHS-master 文件夹并加载其中的 .env Cookie
        # 如果初始化失败（如找不到文件或Cookie失效），会抛出异常
        spider = XHS_Wrapper()
        
        # 2. 执行搜索
        if action == "search":
            # limit=5 默认抓取前5条，可根据需要调整
            # sort_type=0 综合排序 (1最新, 2最热)
            result = spider.search_notes(keyword=query, limit=5, sort_type=0)
            return result

        # 3. 执行详情抓取
        elif action == "detail":
            result = spider.get_note_detail(note_url=query)
            return result
            
        else:
            return {"status": "error", "message": "不支持的 action 类型"}

    except FileNotFoundError:
        return {"status": "error", "message": "环境错误：未找到 Spider_XHS-master 文件夹或 .env 配置"}
    except ValueError as e:
        return {"status": "error", "message": f"Cookie 配置错误: {str(e)}"}
    except Exception as e:
        return {"status": "error", "message": f"运行时未知错误: {str(e)}"}

# ==========================================
# 👇 下面是给 AI 看的调用演示
# ==========================================
if __name__ == "__main__":
    
    # 场景 1：AI 需要搜索关于 "Python" 的内容
    search_response = xhs_tool("search", "Python学习路线")
    
    if search_response['status'] == 'success':
        print("\n✅ 搜索结果:")
        notes = search_response['data']
        # 打印 AI 可以获取到的关键字段
        for note in notes:
            print(f"- 标题: {note['title']}")
            print(f"  链接: {note['link']}")
            print(f"  点赞: {note['likes']}")

        # 场景 2：AI 决定深入阅读第一篇笔记
        if notes:
            first_url = notes[0]['link']
            print(f"\n✅ 正在读取详情: {first_url}")
            
            detail_response = xhs_tool("detail", first_url)
            if detail_response['status'] == 'success':
                content = detail_response['data']
                print(f"- 正文摘要: {content['desc'][:50]}...")
                print(f"- 图片列表: {content['images']}")
            else:
                print(f"❌ 详情获取失败: {detail_response.get('message')}")
    else:
        print(f"❌ 搜索失败: {search_response.get('message')}")
