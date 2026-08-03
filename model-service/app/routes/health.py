from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app import model_loader

router = APIRouter()


@router.get("/health")
def health():
    if model_loader.model_loaded:
        return {"status": "healthy"}
    return JSONResponse(
        status_code=503,
        content={"status": "unhealthy", "detail": "model not loaded"},
    )
