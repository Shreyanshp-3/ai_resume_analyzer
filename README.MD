# README

# ResumeAI

AI-powered resume analysis platform built with **FastAPI, PostgreSQL, React, TypeScript, and Google Gemini**.

The current MVP lets authenticated users upload resumes, extract resume content, analyze resumes with Gemini, persist structured AI results, and view the analysis through a dedicated dashboard.

## Current Status

**MVP v1 complete**

Implemented:

- User registration and login
- JWT authentication
- Protected frontend routes
- Resume upload
- PDF and DOCX support
- 5 MB upload limit
- Resume text extraction
- Resume persistence in PostgreSQL
- Resume deletion
- Gemini-powered resume analysis
- Structured AI analysis
- Analysis persistence
- Overall resume score
- ATS score
- Skills detection
- Strengths
- Weaknesses
- Missing skills
- Recommendations
- AI-generated summary
- Analysis history endpoints
- Dedicated analysis results page
- Dashboard resume cards with scores
- View Analysis / Re-analyze workflow

## Architecture

```
React + TypeScript
        │
        │ REST API
        ▼
     FastAPI
        │
        ├── Authentication / JWT
        ├── Resume APIs
        ├── Analysis APIs
        └── Service Layer
              │
              ├── Resume parsing
              └── Gemini AI service
        │
        ▼
    PostgreSQL
```

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Axios

### Backend

- Python
- FastAPI
- SQLAlchemy
- Alembic
- Pydantic
- PostgreSQL
- JWT authentication
- pwdlib

### AI

- Google Gemini
- `google-genai` Python SDK

The current implementation uses Gemini for resume analysis. The AI provider is isolated behind an AI service so it can be replaced or extended later.

## Project Structure

```
Ai_Resume_Analyzer/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── auth.py
│   │   │   │   ├── resumes.py
│   │   │   │   └── analysis.py
│   │   │   └── dependencies.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── jwt.py
│   │   │   └── security.py
│   │   │
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── resume.py
│   │   │   └── resume_analysis.py
│   │   │
│   │   ├── repositories/
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── ai/
│   │   │   └── parsing/
│   │   └── db/
│   │
│   ├── alembic/
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── api/
        ├── components/
        ├── context/
        ├── pages/
        └── lib/
```

## API

### Authentication

```
POST /auth/register
POST /auth/login
GET  /auth/me
```

### Resumes

```
POST   /resumes/upload
GET    /resumes
GET    /resumes/{resume_id}
DELETE /resumes/{resume_id}
```

### Analysis

```
POST /resumes/{resume_id}/analyze
GET  /resumes/{resume_id}/analyses
GET  /analyses/{analysis_id}
```

The exact analysis route prefix depends on the API router configuration.

## Resume Analysis Output

The current analysis returns structured data including:

```json
{
  "overall_score": 78,
  "ats_score": 85,
  "skills": [],
  "strengths": [],
  "weaknesses": [],
  "missing_skills": [],
  "recommendations": [],
  "summary": "...",
  "model_name": "..."
}
```

### Important Current Limitation

The current scoring is still largely LLM-driven.

Because LLMs are probabilistic, analyzing the exact same resume multiple times can produce somewhat different scores.

This is an identified area for the next version.

The next analysis iteration will introduce a more deterministic scoring framework with explicit scoring categories, fixed weights, objective resume checks, and a clearer separation between measurable signals and LLM judgment.

## Database

Current core entities:

```
users
  │
  └── resumes
        │
        └── resume_analyses
```

Resume analyses are associated with a specific resume and cascade when the resume is deleted.

Database migrations are managed with Alembic.

Useful commands:

```bash
python -m alembic upgrade head
python -m alembic check
python -m alembic history
```

## Local Development

### Backend

From `backend/`:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file containing the required application configuration, database connection, JWT settings, and Gemini API key.

Start the API:

```bash
uvicorn app.main:app --reload --port 8000
```

Swagger documentation:

```
http://localhost:8000/docs
```

### Frontend

From `frontend/`:

```bash
npm install
npm run dev
```

The frontend communicates with the FastAPI backend through the configured API base URL.

## Quality Checks

Backend:

```bash
python -m compileall app
ruff check app
python -m alembic check
```

Frontend:

```bash
npm run build
```

All of these checks should pass before pushing a milestone.

## Security Notes

Do not commit:

```
.env
API keys
JWT secrets
database credentials
uploads/
```

Use environment variables for secrets and local configuration.

## Roadmap

### Completed — MVP v1

- Authentication
- Resume management
- Resume parsing
- Gemini integration
- Persistent analysis
- Analysis dashboard

### Next — Analysis Engine v2

Planned improvements will be finalized before implementation. Potential areas include:

- Deterministic scoring rubric
- Weighted scoring categories
- More reliable ATS evaluation
- Better resume structure analysis
- More precise skill extraction
- Better recommendations
- Consistent repeated analysis
- Explainable score breakdown
- Improved analysis UI

### Future

Potential product capabilities:

- Job description analysis
- Resume-to-job matching
- Job Match Score
- Missing job-specific keywords
- Role-specific recommendations
- Resume improvement suggestions
- Multiple resume versions
- Analysis history and comparison
- Resume version comparison
- Exportable analysis reports

## Versioning

Current milestone:

```
v0.1.0 — MVP
```

The `v0.1.0` tag represents the first working end-to-end MVP.

Future versions should be tagged after meaningful, stable milestones.

## License

This project is currently intended as a portfolio/learning project. Add a formal license before public distribution if required.