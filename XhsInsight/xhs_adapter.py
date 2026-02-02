# -*- coding: utf-8 -*-
import sys
import os
import time
import json

# ================= 路径配置 =================
# 1. 获取当前文件所在目录
current_dir = os.path.dirname(os.path.abspath(__file__))
# 2. 拼接 Spider_XHS-master 的路径
spider_path = os.path.join(current_dir, "Spider_XHS-master")
# 3. 加入搜索路径
sys.path.append(spider_path)
# ===========================================

try:
    print(f"🔄 正在加载爬虫核心: {spider_path}")
    # 从你的工具包导入类
    from apis.xhs_pc_apis import XHS_Apis
    print("✅ 成功导入 XHS_Apis 类！")
except ImportError as e:
    print("\n❌ 严重错误：无法导入爬虫包！")
    print(f"详细错误: {e}\n")
    # 防崩溃替身
    class XHS_Apis: 
        def __init__(self): pass

class XhsService:
    def __init__(self):
        print("⚙️ 初始化爬虫服务...")
        self.api = XHS_Apis()

    def get_qr_code(self):
        """
        因为原爬虫没有二维码功能，这里返回占位图
        """
        return "mock_qr_id", "static/images/qr_placeholder.png"

    def check_login(self, qr_id):
        """
        模拟检查登录
        """
        # 暂时没法扫码，返回一个模拟状态
        # 实际使用时，请在网页侧边栏手动填入 Cookie
        time.sleep(0.5)
        return "mock_cookie_wait_for_input"

    def get_note_data(self, url, cookie):
        """
        核心功能：调用 get_note_info 并清洗数据
        """
        print(f"🔍 正在抓取笔记: {url}")
        
        # 1. 调用你的爬虫函数
        try:
            # 你的爬虫返回三个值: success, msg, res_json
            success, msg, res_json = self.api.get_note_info(url, cookie)
        except Exception as e:
            print(f"❌ 调用 get_note_info 报错: {e}")
            return self._get_error_data(f"代码报错: {e}")

        if not success:
            print(f"❌ 抓取失败，API返回信息: {msg}")
            # 提示用户 Cookie 可能失效
            if "登录" in str(msg) or "401" in str(msg) or "403" in str(msg):
                return self._get_error_data("Cookie 失效或未登录，请在侧边栏更新 Cookie")
            return self._get_error_data(f"抓取失败: {msg}")

        # 2. 数据清洗 (解析 JSON)
        try:
            # 提取 data 节点
            if not res_json or 'data' not in res_json:
                return self._get_error_data("数据格式异常(无data字段)")
                
            # 兼容不同的返回结构
            data_node = res_json['data']
            if 'items' in data_node and len(data_node['items']) > 0:
                note_item = data_node['items'][0]
            else:
                note_item = data_node 
            
            # 提取核心字段
            note_card = note_item.get('note_card', note_item)
            
            title = note_card.get('title', '无标题')
            desc = note_card.get('desc', '无正文')
            
            # 交互数据
            interact = note_card.get('interact_info', {})
            likes = interact.get('liked_count', 0)
            comments_count = interact.get('comment_count', 0)
            collects = interact.get('collected_count', 0)
            
            # 图片列表
            image_list = []
            if 'image_list' in note_card:
                for img in note_card['image_list']:
                    if 'info_list' in img and len(img['info_list']) > 0:
                        image_list.append(img['info_list'][0]['url'])
                    else:
                        image_list.append(img.get('url', ''))

            # 尝试获取评论内容 (拼接为字符串)
            comments_text = ""
            try:
                # 调用获取评论接口
                c_success, c_msg, c_list = self.api.get_note_all_comment(url, cookie)
                if c_success and c_list:
                    # 提取前10条评论内容
                    top_comments = [c['content'] for c in c_list[:10] if 'content' in c]
                    comments_text = " | ".join(top_comments)
            except Exception as e:
                print(f"⚠️ 评论抓取警告: {e}")
                comments_text = "评论抓取失败"

            return {
                "title": title,
                "desc": desc,
                "likes": likes,
                "comments_count": comments_count,
                "collects": collects,
                "images_list": image_list,
                "comments_text": comments_text
            }

        except Exception as e:
            print(f"❌ 数据解析失败: {e}")
            return self._get_error_data("数据解析异常")

    def _get_error_data(self, msg):
        """生成错误时的默认数据"""
        return {
            "title": "❌ 抓取失败",
            "desc": msg,
            "likes": 0,
            "comments_count": 0,
            "images_list": [],
            "comments_text": ""
        }

    def get_user_id_from_cookie(self, cookie):
        # 恢复成默认状态，不要保留真实数据
return "mock_cookie_wait_for_input"

if __name__ == "__main__":
    print("🚀 开始测试 adapter...")
    s = XhsService()
    print("✅ 服务初始化成功")
