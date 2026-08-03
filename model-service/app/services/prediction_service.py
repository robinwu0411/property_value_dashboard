import numpy as np
import pandas as pd

from app import model_loader


def predict(features: list[float]) -> float:
    X = pd.DataFrame([features], columns=model_loader._metadata["features"])
    X_scaled = model_loader._scaler.transform(X)
    pred = model_loader._model.predict(X_scaled)
    return float(pred[0])


def get_metadata() -> dict:
    return model_loader._metadata
