from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.clients.model_client import ModelClientError, predict
from app.database import get_db
from app.models.history import PredictionHistory
from app.repository.history_repository import (
    list_history,
    soft_delete,
    upsert_prediction,
)
from app.schemas import (
    EstimateResponse,
    HistoryItem,
    HistoryListResponse,
    PropertyFeatures,
)

router = APIRouter(prefix="/api")


@router.post("/estimate", response_model=EstimateResponse)
def estimate(features: PropertyFeatures, db: Session = Depends(get_db)):
    try:
        predicted_price = predict(features.model_dump())
    except ModelClientError as e:
        raise HTTPException(status_code=502, detail=e.detail)

    upsert_prediction(db, features.model_dump(), predicted_price)

    return EstimateResponse(predicted_price=predicted_price, saved=True)


@router.get("/history", response_model=HistoryListResponse)
def history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: str | None = Query(None),
    sort_order: str = Query("asc"),
    db: Session = Depends(get_db),
):
    items, total = list_history(
        db, page=page, page_size=page_size,
        sort_by=sort_by, sort_order=sort_order,
    )
    return HistoryListResponse(
        items=[HistoryItem.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/history/{history_id}", response_model=HistoryItem)
def get_history_item(history_id: int, db: Session = Depends(get_db)):
    record = (
        db.query(PredictionHistory)
        .filter_by(id=history_id, deleted_at=None)
        .first()
    )
    if record is None:
        raise HTTPException(status_code=404, detail="history item not found")
    return HistoryItem.model_validate(record)


@router.delete("/history/{history_id}", status_code=204)
def delete_history_item(history_id: int, db: Session = Depends(get_db)):
    deleted = soft_delete(db, history_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="history item not found")
