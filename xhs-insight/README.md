# XHS-Insight: AI-Powered XiaoHongShu Analysis System

## Project Overview
XHS-Insight is a full-stack web application designed to analyze XiaoHongShu (Little Red Book) content. It combines a local Python crawler with Google's Gemini API to provide deep insights into "viral" content, offering content optimization suggestions and psychological profiling.

## Architecture

*   **Frontend**: React 18, TypeScript, Tailwind CSS, Recharts.
*   **Backend**: Python (FastAPI), SQLAlchemy.
*   **Database**: PostgreSQL (Production) / SQLite (Dev).
*   **AI**: Google Gemini API (`gemini-3-flash-preview` for analysis, `gemini-3-pro-preview` for reasoning).

## Directory Structure

*   `src/` (Root): React Frontend source.
*   `backend/`: Python FastAPI backend.
*   `Spider_XHS-master/`: Place your specific crawler scripts here.

## Setup Instructions

### 1. Backend Setup
1.  Navigate to the `backend` directory.
2.  Create a virtual environment: `python -m venv venv`.
3.  Install dependencies: `pip install fastapi uvicorn sqlalchemy pydantic google-genai`.
4.  Run the server: `uvicorn main:app --reload`.

### 2. Frontend Setup
1.  Install dependencies: `npm install`.
2.  Start dev server: `npm run dev`.

### 3. Crawler Integration
1.  Ensure the `Spider_XHS-master` folder exists in the root.
2.  The `backend/crawler_service.py` expects a callable script or class from this folder. Adjust the import in `backend/crawler_service.py` to match your specific crawler implementation.

### 4. Database
The default configuration uses SQLite for easy local setup. For production, update `DATABASE_URL` in `backend/models.py` to point to PostgreSQL.

## Features
*   **Cookie Pool**: Smart rotation and circuit breaking for crawler stability.
*   **AI Analysis**: Automated insights on why a note is popular.
*   **Rewrite Assistant**: One-click content rewriting using Gemini.
*   **Responsive**: Works on Desktop and Mobile.
