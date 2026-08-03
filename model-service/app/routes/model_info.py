from fastapi import APIRouter

from app.services.prediction_service import get_metadata

router = APIRouter()


@router.get("/model-info")
def model_info():
    meta = get_metadata()
    return {
        "model_type": meta["model_type"],
        "features": meta["features"],
        "metrics": meta["metrics"],
        "feature_importances": meta.get("feature_importances"),
        "coefficients": meta.get("coefficients"),
    }
