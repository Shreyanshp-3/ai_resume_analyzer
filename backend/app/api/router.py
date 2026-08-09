from fastapi import APIRouter

from app.api.routes import health

from app.api.routes.auth import router as auth_router

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(auth_router)