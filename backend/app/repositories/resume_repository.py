import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.resume import Resume


class ResumeRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        user_id: uuid.UUID,
        filename: str,
        file_path: str,
        file_type: str,
    ) -> Resume:
        resume = Resume(
            user_id=user_id,
            filename=filename,
            file_path=file_path,
            file_type=file_type,
        )

        self.db.add(resume)
        self.db.commit()
        self.db.refresh(resume)

        return resume

    def get_by_id(
        self,
        resume_id: uuid.UUID,
    ) -> Resume | None:
        statement = select(Resume).where(
            Resume.id == resume_id
        )

        return self.db.scalar(statement)

    def get_user_resumes(
        self,
        user_id: uuid.UUID,
    ) -> list[Resume]:
        statement = (
            select(Resume)
            .where(Resume.user_id == user_id)
            .order_by(Resume.created_at.desc())
        )

        return list(self.db.scalars(statement).all())

    def delete(
        self,
        resume: Resume,
    ) -> None:
        self.db.delete(resume)
        self.db.commit()

    def update_extracted_text(
        self,
        resume: Resume,
        extracted_text: str,
    ) -> Resume:
        resume.extracted_text = extracted_text
        self.db.commit()
        self.db.refresh(resume)
        return resume