from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.auth import UserRegister, Token, UserLogin
from app.services.auth_service import AuthService


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
)
def register(
    data: UserRegister,
    db: Session = Depends(get_db),
):
    auth_service = AuthService(db)

    return auth_service.register(data)


@router.post("/login", response_model=Token)
def login(
    data: UserLogin,
    db: Session = Depends(get_db),
):
    auth_service = AuthService(db)

    access_token = auth_service.login(data)

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user),
):
    return {
        "id": str(current_user.id),
        "name": current_user.name,
        "email": current_user.email,
    }