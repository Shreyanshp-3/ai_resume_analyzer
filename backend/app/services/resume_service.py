import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.resume import Resume
from app.repositories.resume_repository import ResumeRepository


class ResumeService:
    def __init__(self, db: Session):
        self.resume_repository = ResumeRepository(db)

    def create_resume(
        self,
        user_id: uuid.UUID,
        filename: str,
        file_path: str,
        file_type: str,
    ) -> Resume:
        return self.resume_repository.create(
            user_id=user_id,
            filename=filename,
            file_path=file_path,
            file_type=file_type,
        )

    def get_resume(
        self,
        resume_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> Resume:
        resume = self.resume_repository.get_by_id(
            resume_id
        )

        if resume is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found",
            )

        if resume.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this resume",
            )

        return resume

    def get_user_resumes(
        self,
        user_id: uuid.UUID,
    ) -> list[Resume]:
        return self.resume_repository.get_user_resumes(
            user_id
        )

    def delete_resume(
        self,
        resume_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> None:
        resume = self.get_resume(
            resume_id=resume_id,
            user_id=user_id,
        )

        self.resume_repository.delete(resume)