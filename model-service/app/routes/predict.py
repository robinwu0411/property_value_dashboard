from fastapi import APIRouter, HTTPException

from app.schemas import (
    BatchPredictionRequest,
    BatchPredictionResponse,
    PredictionResponse,
    PropertyFeatures,
)
from app.services.prediction_service import predict

router = APIRouter()


def _features_to_list(f: PropertyFeatures) -> list[float]:
    return [
        float(f.square_footage),
        float(f.bedrooms),
        float(f.bathrooms),
        float(f.year_built),
        float(f.lot_size),
        float(f.distance_to_city_center),
        float(f.school_rating),
    ]


@router.post("/predict", response_model=PredictionResponse)
def predict_single(features: PropertyFeatures):
    try:
        price = predict(_features_to_list(features))
        return PredictionResponse(predicted_price=round(price, 2))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.post("/predict/batch", response_model=BatchPredictionResponse)
def predict_batch(request: BatchPredictionRequest):
    results = []
    for i, features in enumerate(request.properties):
        try:
            price = predict(_features_to_list(features))
            results.append(PredictionResponse(predicted_price=round(price, 2)))
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Prediction failed at index {i}: {str(e)}",
            )
    return BatchPredictionResponse(predictions=results)
