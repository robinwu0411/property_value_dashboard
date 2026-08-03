from datetime import datetime

from pydantic import BaseModel, Field


class PropertyFeatures(BaseModel):
    square_footage: int = Field(gt=0, le=50000)
    bedrooms: float = Field(gt=0, le=20)
    bathrooms: float = Field(gt=0, le=10)
    year_built: int = Field(gt=1800, le=2030)
    lot_size: int = Field(gt=0, le=50000)
    distance_to_city_center: float = Field(gt=0, le=100)
    school_rating: float = Field(ge=1, le=10)


class EstimateResponse(BaseModel):
    predicted_price: float
    saved: bool


class HistoryItem(BaseModel):
    id: int
    square_footage: int
    bedrooms: float
    bathrooms: float
    year_built: int
    lot_size: int
    distance_to_city_center: float
    school_rating: float
    predicted_price: float
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class HistoryListResponse(BaseModel):
    items: list[HistoryItem]
    total: int
    page: int
    page_size: int
