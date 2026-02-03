# XHS-Insight

AI-Powered Analytics Platform for Xiaohongshu (Little Red Book).

## Setup & Installation

### 1. Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL or MySQL (Optional, defaults to SQLite)
- Google Gemini API Key

### 2. Backend Setup
1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   ```
2. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. **Crawler Integration**:
   Place your `Spider_XHS-master` folder in the root directory. Ensure `xhs_ai_wrapper.py` is accessible.
4. Run the server:
   ```bash
   uvicorn backend.main:app --reload
   ```

### 3. Frontend Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run development server:
   ```bash
   npm start
   ```

## Features
- **Cookie Rotation**: Automatically manages a pool of cookies, detecting invalid ones (401 errors) and switching to the next available one.
- **AI Analysis**: Uses Google Gemini to analyze viral reasons and user psychology.
- **Data Management**: Save notes to folders, export data, and batch delete.
