import json
import os

import joblib
import numpy as np

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..")

model_loaded = False
_model = None
_scaler = None
_metadata: dict = {}


def load_model():
    global model_loaded, _model, _scaler, _metadata

    model_path = os.path.join(MODEL_DIR, "model.pkl")
    scaler_path = os.path.join(MODEL_DIR, "scaler.pkl")
    metadata_path = os.path.join(MODEL_DIR, "metadata.json")

    missing = [p for p in [model_path, scaler_path, metadata_path] if not os.path.exists(p)]
    if missing:
        raise FileNotFoundError(f"Missing model files: {missing}")

    _model = joblib.load(model_path)
    _scaler = joblib.load(scaler_path)
    with open(metadata_path, "r") as f:
        _metadata = json.load(f)

    model_loaded = True
