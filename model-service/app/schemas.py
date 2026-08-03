from pydantic import BaseModel, Field


class PropertyFeatures(BaseModel):
    square_footage: int = Field(gt=0, le=50000, description="Living area in sq.ft")
    bedrooms: float = Field(gt=0, le=20, description="Number of bedrooms")
    bathrooms: float = Field(gt=0, le=10, description="Number of bathrooms")
    year_built: int = Field(gt=1800, le=2030, description="Year of construction")
    lot_size: int = Field(gt=0, le=50000, description="Lot area in sq.ft")
    distance_to_city_center: float = Field(gt=0, le=100, description="Distance in miles")
    school_rating: float = Field(ge=1, le=10, description="School rating 1-10")


class PredictionResponse(BaseModel):
    predicted_price: float


class BatchPredictionRequest(BaseModel):
    properties: list[PropertyFeatures]


class BatchPredictionResponse(BaseModel):
    predictions: list[PredictionResponse]
