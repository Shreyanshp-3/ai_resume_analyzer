import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ResumeResponse(BaseModel):
    id: uuid.UUID
    filename: str
    file_type: str
    upload_status: str
    extracted_text: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class ResumeListResponse(BaseModel):
    resumes: list[ResumeResponse]