from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.jwt import create_access_token
from app.core.security import hash_password, verify_password
from app.repositories.user_repository import UserRepository
from app.schemas.auth import UserLogin, UserRegister


class AuthService:
    def __init__(self, db: Session):
        self.user_repository = UserRepository(db)

    def register(self, data: UserRegister):
        existing_user = self.user_repository.get_by_email(data.email)

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )

        hashed_password = hash_password(data.password)

        return self.user_repository.create(
            name=data.name,
            email=data.email,
            hashed_password=hashed_password,
        )

    def login(self, data: UserLogin):
        user = self.user_repository.get_by_email(data.email)

        if not user or not verify_password(
            data.password,
            user.hashed_password,
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        access_token = create_access_token(str(user.id))

        return access_token