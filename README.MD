# AI Resume Analyzer

A production-style full-stack AI application that analyzes resumes, extracts structured information, and provides AI-powered feedback and job-matching insights.

The project is primarily a Python full-stack application built with FastAPI and React, with OpenAI used as the AI reasoning layer.

---

## 🚀 Project Overview

AI Resume Analyzer allows users to -

- Create an account and securely authenticate
- Upload resumes
- Extract text and structured information from resumes
- Analyze resumes using OpenAI
- Identify skills, experience, education, and other relevant information
- Compare resumes against job descriptions
- Generate personalized improvement suggestions
- View analysis history through a dashboard

The project is designed to demonstrate production-oriented full-stack and AI engineering practices rather than simply making an LLM API call.

---

## 🏗️ Architecture

```text
                    AI Resume Analyzer
                           │
          ┌────────────────┴────────────────┐
          │                                 │
      Frontend                          Backend
          │                                 │
     React + TS                         FastAPI
          │                                 │
          └──────────────┬──────────────────┘
                         │
                    PostgreSQL
                         │
                      Docker
                         │
                    AI Layer
                         │
                    OpenAI API