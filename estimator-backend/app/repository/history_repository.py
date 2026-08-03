from datetime import datetime

from sqlalchemy import func
from sqlalchemy.dialects.mysql import insert as mysql_insert
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.orm import Session

from app.models.history import PredictionHistory


def _upsert_stmt(features: dict, predicted_price: float):
    if features.get("id"):
        features = {k: v for k, v in features.items() if k != "id"}
    return {
        "mysql": mysql_insert(PredictionHistory)
        .values(**features, predicted_price=predicted_price)
        .on_duplicate_key_update(
            predicted_price=predicted_price,
            updated_at=func.now(),
            deleted_at=None,
        ),
        "sqlite": sqlite_insert(PredictionHistory)
        .values(**features, predicted_price=predicted_price)
        .on_conflict_do_update(
            index_elements=[
                "square_footage",
                "bedrooms",
                "bathrooms",
                "year_built",
                "lot_size",
                "distance_to_city_center",
                "school_rating",
            ],
            set_=dict(
                predicted_price=predicted_price,
                updated_at=func.now(),
                deleted_at=None,
            ),
        ),
    }


def upsert_prediction(
    db: Session, features: dict, predicted_price: float
) -> PredictionHistory:
    dialect = db.bind.dialect.name if db.bind else "mysql"
    stmts = _upsert_stmt(features, predicted_price)
    stmt = stmts.get(dialect, stmts["mysql"])
    db.execute(stmt)
    db.commit()

    return (
        db.query(PredictionHistory)
        .filter_by(**features, deleted_at=None)
        .first()
    )


def soft_delete(db: Session, history_id: int) -> bool:
    record = db.get(PredictionHistory, history_id)
    if record is None or record.deleted_at is not None:
        return False
    record.deleted_at = datetime.now()
    db.commit()
    return True


SORT_WHITELIST = {
    "created_at", "square_footage", "bedrooms", "bathrooms",
    "year_built", "lot_size", "distance_to_city_center",
    "school_rating", "predicted_price",
}


def list_history(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    include_deleted: bool = False,
    sort_by: str | None = None,
    sort_order: str = "asc",
) -> tuple[list[PredictionHistory], int]:
    base = db.query(PredictionHistory)
    if not include_deleted:
        base = base.filter(PredictionHistory.deleted_at.is_(None))
    total = base.count()

    if sort_by and sort_by in SORT_WHITELIST:
        col = getattr(PredictionHistory, sort_by)
        order = col.desc() if sort_order == "desc" else col.asc()
    else:
        order = PredictionHistory.created_at.desc()
    items = (
        base.order_by(order)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return items, total
