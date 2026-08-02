from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/")
def root():
    return {"message": "Welcome to AI Resume Analyzer API"}


@router.get("/health")
def health():
    return {"status": "healthy"}