import pytest
from fastapi.testclient import TestClient

from app import model_loader
from app.main import app


@pytest.fixture(scope="session", autouse=True)
def _load_model():
    model_loader.load_model()


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c
