import io
import uuid
import zipfile
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.resume import (
    ResumeListResponse,
    ResumeResponse,
)
from app.services.resume_service import ResumeService

router = APIRouter(
    prefix="/resumes",
    tags=["Resumes"],
)


UPLOAD_DIR = Path("uploads/resumes")

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".docx",
}

MAX_FILE_SIZE = 5 * 1024 * 1024


def validate_file_content(
    content: bytes,
    extension: str,
) -> None:
    if extension == ".pdf":
        if not content.startswith(b"%PDF-"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid PDF file",
            )

    elif extension == ".docx":
        try:
            with zipfile.ZipFile(io.BytesIO(content)) as archive:
                if "word/document.xml" not in archive.namelist():
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid DOCX file",
                    )
        except zipfile.BadZipFile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid DOCX file",
            ) from None


@router.post(
    "/upload",
    response_model=ResumeResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    extension = Path(file.filename or "").suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and DOCX files are supported",
        )

    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size must be less than 5 MB",
        )

    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty",
        )

    validate_file_content(
        content=content,
        extension=extension,
    )

    UPLOAD_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    resume_id = uuid.uuid4()

    stored_filename = f"{resume_id}{extension}"

    file_path = UPLOAD_DIR / stored_filename

    file_path.write_bytes(content)

    resume_service = ResumeService(db)

    return resume_service.create_resume(
        user_id=current_user.id,
        filename=file.filename or stored_filename,
        file_path=str(file_path),
        file_type=extension,
    )

    #return resume


@router.get(
    "",
    response_model=ResumeListResponse,
)
def get_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume_service = ResumeService(db)

    resumes = resume_service.get_user_resumes(
        user_id=current_user.id,
    )

    return {
        "resumes": resumes,
    }


@router.get(
    "/{resume_id}",
    response_model=ResumeResponse,
)
def get_resume(
    resume_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume_service = ResumeService(db)

    return resume_service.get_resume(
        resume_id=resume_id,
        user_id=current_user.id,
    )


@router.delete(
    "/{resume_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_resume(
    resume_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume_service = ResumeService(db)

    resume_service.delete_resume(
        resume_id=resume_id,
        user_id=current_user.id,
    )

