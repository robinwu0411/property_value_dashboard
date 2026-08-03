def test_model_info_returns_metadata(client):
    response = client.get("/model-info")
    assert response.status_code == 200

    data = response.json()
    assert data["model_type"] == "RandomForestRegressor"
    assert len(data["features"]) == 7
    assert "r2" in data["metrics"]
    assert "rmse" in data["metrics"]
    assert "mae" in data["metrics"]
    assert len(data["feature_importances"]) == 7
