from app.services.prediction_service import predict, get_metadata

FEATURES = [1850.0, 3.0, 2.0, 1998.0, 7500.0, 5.6, 8.2]


def test_predict_returns_positive_float():
    price = predict(FEATURES)
    assert isinstance(price, float)
    assert price > 0


def test_get_metadata_has_required_keys():
    meta = get_metadata()
    assert meta["model_type"] == "RandomForestRegressor"
    assert len(meta["features"]) == 7
    assert "r2" in meta["metrics"]
