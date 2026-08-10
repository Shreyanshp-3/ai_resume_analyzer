from fastapi import APIRouter

from app.api.routes import health
from app.api.routes.auth import router as auth_router
from app.api.routes.resumes import router as resumes_router


api_router = APIRouter()


api_router.include_router(health.router)
api_router.include_router(auth_router)
api_router.include_router(resumes_router)