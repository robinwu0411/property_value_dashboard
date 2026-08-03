from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from app.clients.model_client import ModelClientError
from app.models.history import PredictionHistory

PROPERTY = {
    "square_footage": 1850,
    "bedrooms": 3,
    "bathrooms": 2,
    "year_built": 1998,
    "lot_size": 7500,
    "distance_to_city_center": 5.6,
    "school_rating": 8.2,
}


class TestEstimate:
    def test_estimate_returns_price_and_saved(self, client: TestClient, db):
        with patch("app.routes.estimator.predict", return_value=450000.0):
            resp = client.post("/api/estimate", json=PROPERTY)

        assert resp.status_code == 200
        data = resp.json()
        assert data["predicted_price"] == 450000.0
        assert data["saved"] is True

        record = (
            db.query(PredictionHistory)
            .filter_by(**{k: v for k, v in PROPERTY.items()})
            .first()
        )
        assert record is not None
        assert record.predicted_price == 450000.0

    def test_estimate_invalid_input_returns_422(self, client: TestClient):
        bad = {**PROPERTY, "square_footage": -1}
        resp = client.post("/api/estimate", json=bad)
        assert resp.status_code == 422

    def test_estimate_model_client_error_returns_502(self, client: TestClient):
        with patch(
            "app.routes.estimator.predict",
            side_effect=ModelClientError(503, "circuit breaker open"),
        ):
            resp = client.post("/api/estimate", json=PROPERTY)

        assert resp.status_code == 502
        assert "circuit breaker open" in resp.json()["detail"]


class TestHistory:
    def test_history_returns_paginated_list(self, client: TestClient, db):
        records = [
            PredictionHistory(
                **PROPERTY,
                predicted_price=450000.0,
            ),
            PredictionHistory(
                **{**PROPERTY, "bedrooms": 4},
                predicted_price=520000.0,
            ),
        ]
        db.add_all(records)
        db.commit()

        resp = client.get("/api/history?page=1&page_size=10")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 2
        assert len(data["items"]) == 2
        assert data["page"] == 1

    def test_history_empty_returns_zero(self, client: TestClient):
        resp = client.get("/api/history")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 0
        assert data["items"] == []


class TestHistoryItem:
    def test_get_history_item_returns_record(self, client: TestClient, db):
        record = PredictionHistory(**PROPERTY, predicted_price=450000.0)
        db.add(record)
        db.commit()

        resp = client.get(f"/api/history/{record.id}")
        assert resp.status_code == 200
        assert resp.json()["id"] == record.id
        assert resp.json()["predicted_price"] == 450000.0

    def test_get_history_item_not_found_returns_404(self, client: TestClient):
        resp = client.get("/api/history/99999")
        assert resp.status_code == 404


class TestDeleteHistoryItem:
    def test_delete_history_item_returns_204(self, client: TestClient, db):
        record = PredictionHistory(**PROPERTY, predicted_price=450000.0)
        db.add(record)
        db.commit()

        resp = client.delete(f"/api/history/{record.id}")
        assert resp.status_code == 204

    def test_delete_already_deleted_returns_404(self, client: TestClient, db):
        from datetime import datetime

        record = PredictionHistory(
            **PROPERTY,
            predicted_price=450000.0,
            deleted_at=datetime.now(),
        )
        db.add(record)
        db.commit()

        resp = client.delete(f"/api/history/{record.id}")
        assert resp.status_code == 404

    def test_delete_not_found_returns_404(self, client: TestClient):
        resp = client.delete("/api/history/99999")
        assert resp.status_code == 404
