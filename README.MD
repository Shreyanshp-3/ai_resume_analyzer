# AI Resume Analyzer

An AI-powered resume analysis platform that evaluates resumes against a target job role using Google's Gemini models.

The application analyzes resume structure, keyword alignment, experience relevance, measurable impact, formatting, and potential ATS/recruiter red flags. It then provides actionable recommendations to improve the resume.

## 🚀 Live Demo

- Frontend: https://ai-resume-analyzer-two-khaki.vercel.app
- Backend API: https://ai-resume-analyzer-api-pw2d.onrender.com

## ✨ Features

### Authentication
- User registration and login
- JWT-based authentication
- Protected API routes
- Secure password hashing
- User-specific resume access

### Resume Management
- Upload PDF and DOCX resumes
- File type validation
- File size validation
- PDF/DOCX content validation
- Automatic resume text extraction
- Resume history
- Resume deletion

### AI Resume Analysis

Users provide:

- Target job role
- Years of experience

The AI evaluates the resume across:

- Parseability
- Role & keyword match
- Experience alignment
- Impact & quantification
- Formatting & length
- ATS/recruiter red flags

The system also generates:

- Overall ATS score
- Matched keywords
- Missing keywords
- Skills detected
- Strengths
- Weaknesses
- Recommendations
- Top 3 improvements
- Detailed summary

### Production Features

- PostgreSQL database
- Neon PostgreSQL deployment
- Alembic database migrations
- FastAPI REST API
- CORS configuration
- Environment-based configuration
- Gemini API error handling
- Rate-limit/quota handling
- Production deployment on Render
- Frontend deployment on Vercel

---

# 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │       User          │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │     TypeScript      │
                    └──────────┬──────────┘
                               │
                         REST API / JWT
                               │
                               ▼
                    ┌─────────────────────┐
                    │   FastAPI Backend   │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
       Authentication      Resume Service    Analysis Service
             │                 │                 │
             │                 ▼                 ▼
             │          Resume Extraction    Gemini AI
             │                 │                 │
             └─────────────────┼─────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Neon PostgreSQL    │
                    └─────────────────────┘