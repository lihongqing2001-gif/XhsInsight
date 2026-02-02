# 📕 XhsInsight - 小红书爆款内容 AI 分析台

**XhsInsight** 是一个集成 **数据抓取** 与 **AI 深度分析** 的本地化工具。它能通过链接自动提取小红书笔记的图文、互动数据，并利用 **Google Gemini AI** 模型深度剖析其成为“爆款”的底层逻辑，帮助创作者快速拆解对标账号。

![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![Streamlit](https://img.shields.io/badge/UI-Streamlit-red)
![AI](https://img.shields.io/badge/Model-Gemini%202.5%20Flash-orange)

## ✨ 核心功能

1.  **🚀 一键抓取**：只需输入笔记链接，自动解析标题、正文、点赞/收藏/评论数及无水印封面图。
2.  **🧠 AI 洞察**：内置 Google Gemini 模型，从选题、情绪、视觉、文案四个维度自动生成分析报告。
3.  **📂 历史档案**：所有分析记录自动存入本地 SQLite 数据库，支持随时回溯查看。
4.  **🛡️ 安全登录**：支持在网页侧边栏手动输入 Cookie，无需修改代码，降低封号风险。

## 🛠️ 技术栈

* **前端/交互**: Streamlit
* **核心逻辑**: Python 3
* **爬虫支持**: Requests + PyExecJs (Node.js 环境)
* **AI 模型**: Google Gemini API
* **数据存储**: SQLite3

## ⚙️ 环境准备 (必读)

在运行本项目之前，请确保你的电脑已安装以下环境：

1.  **Python 3.8 或更高版本**
2.  **Node.js (必须安装)**
    * 爬虫依赖 Node.js 运行 JS 加密算法。
    * 验证方法：在终端输入 `node -v`，有版本号输出即可。

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone [https://github.com/你的用户名/XhsInsight.git](https://github.com/你的用户名/XhsInsight.git)
cd XhsInsight
2. 安装依赖
Bash
pip install -r requirements.txt
3. 配置 API Key
打开 ai_analyzer.py 文件，找到配置区域，填入你的 Google Gemini API Key：

Python
# 推荐使用环境变量，或在本地测试时填入
GEMINI_API_KEY = "你的_Gemini_API_Key"
4. 启动应用
Bash
streamlit run app.py
启动后，浏览器会自动打开 http://localhost:8501。

📖 使用指南
登录配置：

打开网页左侧侧边栏。

在“粘贴 Cookie”输入框中，填入从小红书网页版 (F12 -> Network) 获取的完整 Cookie 字符串。

点击“确认登录”。

开始分析：

在主界面输入小红书笔记链接（支持批量，一行一个）。

点击 “开始分析 🚀”。

等待进度条完成，查看 AI 生成的分析卡片。

查看历史：

切换到“📜 历史档案库”标签页，查看过往所有分析记录。
📂 项目结构
Plaintext
XhsInsight/
├── app.py              # 程序主入口 (Streamlit)
├── xhs_adapter.py      # 爬虫适配器 (处理登录与抓取)
├── ai_analyzer.py      # AI 分析模块 (调用 Gemini)
├── db_manager.py       # 数据库管理 (SQLite)
├── utils.py            # 工具函数 (图片下载等)
├── static/             # 静态资源 (JS 算法文件)
│   └── images/         # 本地缓存的笔记封面
├── xhs_history.db      # 本地数据库 (自动生成)
└── Spider_XHS-master/  # 爬虫核心依赖库
⚠️ 免责声明
本项目仅供 Python 编程与 AI 应用学习交流使用。

请勿用于商业用途或大规模非法爬取。

使用者需自行承担因使用本工具产生的一切法律后果。

小红书数据版权归原平台所有。
Created with ❤️ by [lihongqing2001-gif]
