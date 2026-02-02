# -*- coding: utf-8 -*-
import streamlit as st
import time
import os

# 导入我们写的模块
import db_manager as db
import utils
import ai_analyzer
from xhs_adapter import XhsService

# === 1. 系统初始化 ===
st.set_page_config(page_title="XhsInsight", layout="wide", page_icon="📕")
db.init_db() # 确保数据库存在
service = XhsService() # 实例化接口服务

# === 2. Session 状态管理 (内存记忆) ===
if 'is_logged_in' not in st.session_state:
    st.session_state['is_logged_in'] = False
if 'user_cookie' not in st.session_state:
    st.session_state['user_cookie'] = ""
if 'current_user_id' not in st.session_state:
    st.session_state['current_user_id'] = "default_user"

# === 3. 侧边栏：登录控制台 ===
with st.sidebar:
    st.title("👤 账号设置")
    
    # 🌟 新增：直接在网页输入 Cookie，不用改代码了
    st.markdown("### 🔑 第一步：填写 Cookie")
    st.info("请从浏览器复制 Cookie 填入下方，否则无法抓取。")
    
    # 输入框
    cookie_input = st.text_input("粘贴 Cookie", type="password", value=st.session_state['user_cookie'])
    
    if st.button("确认登录 / 更新 Cookie"):
        if len(cookie_input) < 10:
            st.error("Cookie 太短了，请检查是否复制完整")
        else:
            st.session_state['user_cookie'] = cookie_input
            st.session_state['is_logged_in'] = True
            st.success("✅ Cookie 已保存！")
            time.sleep(1)
            st.rerun()

    st.divider()
    
    # 显示状态
    if st.session_state['is_logged_in']:
        st.success(f"🟢 状态：已登录")
        if st.button("清除登录信息"):
            st.session_state['user_cookie'] = ""
            st.session_state['is_logged_in'] = False
            st.rerun()
    else:
        st.warning("🔴 状态：未配置 Cookie")

# === 4. 主界面 ===
st.title("📕 小红书爆款分析台")

if not st.session_state['is_logged_in']:
    st.warning("👈 请先在左侧侧边栏填入 Cookie 才能开始使用")
    st.stop()

# 界面分栏
tab1, tab2 = st.tabs(["🚀 开始新分析", "📜 历史档案库"])

# --- 页面 1: 分析 ---
with tab1:
    st.subheader("提交笔记链接")
    urls_input = st.text_area("请输入小红书笔记链接 (每行一个)", height=100, placeholder="https://www.xiaohongshu.com/explore/...")
    start_btn = st.button("开始分析 🚀", type="primary")
    
    if start_btn and urls_input:
        url_list = [u.strip() for u in urls_input.split('\n') if u.strip()]
        
        progress_bar = st.progress(0)
        status_text = st.empty()
        
        for i, url in enumerate(url_list):
            status_text.text(f"正在处理第 {i+1} 个链接...")
            
            try:
                # A. 抓取数据 (传入刚才保存的 Cookie)
                note_data = service.get_note_data(url, st.session_state['user_cookie'])
                note_data['url'] = url 
                
                # 检查是否抓取失败
                if "❌" in note_data.get('title', ''):
                    st.error(f"链接 {url} 抓取失败: {note_data.get('desc')}")
                    continue

                # B. 下载封面
                if note_data.get('images_list'):
                    cover_url = note_data['images_list'][0]
                    local_path = utils.download_image(cover_url)
                    note_data['local_cover'] = local_path
                else:
                    note_data['local_cover'] = None
                
                # C. AI 分析
                with st.spinner("🧠 AI 正在思考爆款原因..."):
                    ai_res = ai_analyzer.analyze_content(
                        note_data.get('title'), 
                        note_data.get('desc'), 
                        note_data.get('comments_text')
                    )
                    note_data['ai_analysis'] = ai_res
                
                # D. 存入数据库
                db.save_analysis(st.session_state['current_user_id'], note_data)
                
                # E. 即时展示结果卡片
                with st.container(border=True):
                    c1, c2 = st.columns([1, 3])
                    with c1:
                        if note_data.get('local_cover'):
                            st.image(note_data['local_cover'])
                    with c2:
                        st.markdown(f"### {note_data['title']}")
                        st.caption(f"❤️ {note_data['likes']} | ⭐ {note_data['collects']} | 💬 {note_data['comments_count']}")
                        st.success(note_data['ai_analysis'])
                
            except Exception as e:
                st.error(f"处理链接 {url} 时发生未知错误: {e}")
            
            progress_bar.progress((i + 1) / len(url_list))
        
        status_text.text("✅ 所有任务处理完毕！")

# --- 页面 2: 历史 ---
with tab2:
    st.subheader("我的分析历史")
    history = db.get_history_by_user(st.session_state['current_user_id'])
    
    if not history:
        st.info("暂无记录")
    else:
        for item in history:
            with st.container(border=True):
                c1, c2 = st.columns([1, 4])
                with c1:
                    if item.get('cover_path') and os.path.exists(item['cover_path']):
                        st.image(item['cover_path'], use_container_width=True)
                    else:
                        st.text("封面缺失")
                with c2:
                    st.markdown(f"### [{item['title']}]({item['url']})")
                    st.caption(f"📅 {item['created_at']} | ❤️ {item['likes']} | 💬 {item['comments']}")
                    st.info(f"🤖 AI洞察: {item['ai_analysis']}")
