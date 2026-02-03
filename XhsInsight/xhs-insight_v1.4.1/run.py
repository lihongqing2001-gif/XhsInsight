# -*- coding: utf-8 -*-
from xhs_ai_wrapper import XHS_Wrapper
import json

def test_spider():
    print("🚀 开始测试爬虫...")
    
    try:
        # 1. 初始化
        # 它会自动去 Spider_XHS-master/.env 找 Cookie
        spider = XHS_Wrapper()
        print("✅ 初始化成功！")
        
    except FileNotFoundError as e:
        print(f"❌ 文件错误: {e}")
        return
    except ValueError as e:
        print(f"❌ 配置错误: {e}")
        return
    except Exception as e:
        print(f"❌ 未知错误: {e}")
        return

    # 2. 测试搜索功能
    keyword = "猫咪"
    print(f"\n🔍 正在测试搜索关键词: [{keyword}] ...")
    
    search_res = spider.search_notes(keyword, limit=3)
    
    if search_res['status'] == 'success':
        notes = search_res['data']
        print(f"✅ 搜索测试通过！找到了 {len(notes)} 条笔记：")
        
        for i, note in enumerate(notes):
            print(f"   {i+1}. {note['title']} (ID: {note['id']})")
            
        # 3. 测试获取详情功能 (如果搜索到了笔记)
        if len(notes) > 0:
            first_url = notes[0]['link']
            print(f"\n📖 正在测试获取单篇笔记详情: {first_url}")
            
            detail_res = spider.get_note_detail(first_url)
            
            if detail_res['status'] == 'success':
                data = detail_res['data']
                print("✅ 详情测试通过！")
                print(f"   标题: {data['title']}")
                print(f"   点赞: {data['stats']['liked_count']}")
                print(f"   图片数: {len(data['images'])}")
            else:
                print(f"❌ 详情测试失败: {detail_res['message']}")
    else:
        print(f"❌ 搜索测试失败: {search_res['message']}")
        # 常见错误分析
        if "登录" in str(search_res['message']):
            print("\n⚠️ 诊断: Cookie 可能已过期或无效，请重新复制 web_session 到 .env 文件中。")

if __name__ == "__main__":
    test_spider()
