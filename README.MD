# 🚀 AI Resume Analyzer

A production-quality AI Resume Analyzer built with **FastAPI**, **React**, **PostgreSQL**, **Docker**, and **Large Language Models (LLMs)**.

This project is being developed as a flagship AI Engineering portfolio project and will evolve through multiple stages, from a production-ready MVP to advanced AI capabilities such as semantic search, embeddings, and Retrieval-Augmented Generation (RAG).

---

## ✨ Features

### MVP
- User Authentication (JWT)
- Resume Upload (PDF/DOCX)
- Resume Parsing
- AI Resume Analysis
- Resume Scoring
- Skills Extraction
- Strengths & Weaknesses Analysis
- Resume Improvement Suggestions
- Job Description Matching
- Match Percentage
- Matching & Missing Skills
- Dockerized Full Stack Application

### Future Enhancements
- Advanced Prompt Engineering
- Structured AI Outputs
- Function Calling
- Workflow Orchestration
- Embeddings
- Vector Database
- Semantic Resume ↔ Job Description Matching
- Retrieval-Augmented Generation (RAG)
- Company-Specific Resume Recommendations

---

## 🛠️ Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Query
- Axios

### Backend
- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL
- JWT Authentication

### AI
- OpenAI / LLM Provider (Provider Abstraction)

### DevOps
- Docker
- Docker Compose

---

## 📂 Project Structure

```text
ai-resume-analyzer/
│
├── backend/
│   ├── app/
│   ├── alembic/
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│
├── docs/
│
├── docker/
│
├── scripts/
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 📌 Current Progress

- ✅ Sprint 0 — Project Foundation
- 🚧 Sprint 1 — Authentication

---

## 🗺️ Roadmap

### Sprint 0
- Project Setup
- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- Docker
- Database Migrations

### Sprint 1
- Authentication
- JWT
- Password Hashing
- Protected Routes

### Sprint 2
- Resume Upload
- Resume Management

### Sprint 3
- Resume Parsing

### Sprint 4
- AI Resume Analysis

### Sprint 5
- Job Description Matching

### Sprint 6
- Frontend Integration

### Sprint 7
- Production Readiness & Deployment

---

## 🚀 Getting Started

### Clone the Repository

```bash
git clone https://github.com/<your-username>/ai-resume-analyzer.git
cd ai-resume-analyzer
```

### Backend Setup

```bash
cd backend

python3 -m venv .venv

source .venv/bin/activate

pip install -r requirements.txt
```

### Start PostgreSQL

```bash
docker compose up -d
```

### Run the Backend

```bash
uvicorn app.main:app --reload
```

---

## 📖 API Documentation

Once the backend is running:

Swagger UI

```
http://127.0.0.1:8000/docs
```

ReDoc

```
http://127.0.0.1:8000/redoc
```

---

## 🎯 Project Goals

- Build a production-quality AI application.
- Follow clean architecture and software engineering best practices.
- Develop a scalable backend using FastAPI.
- Integrate modern LLMs through an abstract AI layer.
- Continuously evolve the project through advanced AI engineering concepts.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Shreyansh Patil**

Built as a flagship AI Engineering portfolio project.