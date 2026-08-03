PROPERTY = {
    "square_footage": 1850,
    "bedrooms": 3,
    "bathrooms": 2,
    "year_built": 1998,
    "lot_size": 7500,
    "distance_to_city_center": 5.6,
    "school_rating": 8.2,
}


def test_predict_single_returns_price(client):
    response = client.post("/predict", json=PROPERTY)
    assert response.status_code == 200

    data = response.json()
    assert "predicted_price" in data
    assert data["predicted_price"] > 0


def test_predict_single_positive_price(client):
    response = client.post("/predict", json=PROPERTY)
    assert response.json()["predicted_price"] > 100_000


def test_predict_batch_returns_array(client):
    batch = {"properties": [PROPERTY, PROPERTY]}
    response = client.post("/predict/batch", json=batch)
    assert response.status_code == 200

    data = response.json()
    assert "predictions" in data
    assert len(data["predictions"]) == 2
    for p in data["predictions"]:
        assert p["predicted_price"] > 0


def test_predict_invalid_field_returns_422(client):
    bad = {**PROPERTY, "square_footage": -1}
    response = client.post("/predict", json=bad)
    assert response.status_code == 422


def test_predict_missing_field_returns_422(client):
    bad = {k: v for k, v in PROPERTY.items() if k != "bedrooms"}
    response = client.post("/predict", json=bad)
    assert response.status_code == 422
