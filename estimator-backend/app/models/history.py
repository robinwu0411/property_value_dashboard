from datetime import datetime

from sqlalchemy import DECIMAL, TIMESTAMP, BigInteger, Integer, UniqueConstraint, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id: Mapped[int] = mapped_column(
        BigInteger().with_variant(Integer(), "sqlite"),
        primary_key=True,
        autoincrement=True,
    )
    square_footage: Mapped[int] = mapped_column(Integer, nullable=False)
    bedrooms: Mapped[float] = mapped_column(DECIMAL(3, 1), nullable=False)
    bathrooms: Mapped[float] = mapped_column(DECIMAL(3, 1), nullable=False)
    year_built: Mapped[int] = mapped_column(Integer, nullable=False)
    lot_size: Mapped[int] = mapped_column(Integer, nullable=False)
    distance_to_city_center: Mapped[float] = mapped_column(DECIMAL(5, 2), nullable=False)
    school_rating: Mapped[float] = mapped_column(DECIMAL(3, 1), nullable=False)
    predicted_price: Mapped[float] = mapped_column(DECIMAL(12, 2), nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(TIMESTAMP, nullable=True, default=None)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP, server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        UniqueConstraint(
            "square_footage",
            "bedrooms",
            "bathrooms",
            "year_built",
            "lot_size",
            "distance_to_city_center",
            "school_rating",
            name="uq_features",
        ),
    )
