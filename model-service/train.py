import json
import os
import warnings

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings("ignore")

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "House Price Dataset.csv")
OUTPUT_DIR = os.path.dirname(__file__)

FEATURES = [
    "square_footage",
    "bedrooms",
    "bathrooms",
    "year_built",
    "lot_size",
    "distance_to_city_center",
    "school_rating",
]
TARGET = "price"


def load_data(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    if "id" in df.columns:
        df = df.drop(columns=["id"])
    df = df.dropna()
    return df


def eda(df: pd.DataFrame):
    print("=" * 60)
    print("DATA OVERVIEW")
    print("=" * 60)
    print(f"Records: {len(df)}")
    print(f"Features: {FEATURES}")
    print(f"\nDescriptive Statistics:\n{df.describe()}")
    print(f"\nCorrelation with Price:\n{df.corr()[TARGET].sort_values(ascending=False)}")


def train_and_evaluate(X_train, X_test, y_train, y_test, scaler):
    models = {
        "LinearRegression": LinearRegression(),
        "RandomForestRegressor": RandomForestRegressor(n_estimators=100, random_state=42),
    }

    best_model = None
    best_score = -float("inf")
    best_name = None
    results = []

    for name, model in models.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)

        r2 = r2_score(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        mae = mean_absolute_error(y_test, y_pred)

        cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring="r2")
        cv_r2 = cv_scores.mean()

        results.append(
            {
                "model": name,
                "r2": round(r2, 4),
                "rmse": round(rmse, 2),
                "mae": round(mae, 2),
                "cv_r2_mean": round(cv_r2, 4),
            }
        )

        print(f"\n{name}: R²={r2:.4f}  RMSE={rmse:.2f}  MAE={mae:.2f}  CV_R²={cv_r2:.4f}")

        if cv_r2 > best_score:
            best_score = cv_r2
            best_model = model
            best_name = name

    print(f"\nBest model: {best_name} (CV R² = {best_score:.4f})")
    return best_model, best_name, results


def extract_model_info(model, model_name: str, scaler, metrics: dict) -> dict:
    info = {
        "model_type": model_name,
        "features": FEATURES,
        "feature_order": FEATURES,
        "scaler_mean": scaler.mean_.tolist(),
        "scaler_scale": scaler.scale_.tolist(),
        "metrics": metrics,
    }

    if model_name == "LinearRegression":
        info["coefficients"] = dict(zip(FEATURES, model.coef_.tolist()))
        info["intercept"] = float(model.intercept_)
    else:
        info["feature_importances"] = dict(zip(FEATURES, model.feature_importances_.tolist()))

    return info


def main():
    print("Loading data...")
    df = load_data(DATA_PATH)
    eda(df)

    X = df[FEATURES]
    y = df[TARGET]

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42
    )

    best_model, best_name, all_results = train_and_evaluate(
        X_train, X_test, y_train, y_test, scaler
    )

    metrics = {
        "r2": all_results[-1]["r2"],
        "rmse": all_results[-1]["rmse"],
        "mae": all_results[-1]["mae"],
    }
    # Use best model's metrics
    for r in all_results:
        if r["model"] == best_name:
            metrics = {"r2": r["r2"], "rmse": r["rmse"], "mae": r["mae"]}

    model_path = os.path.join(OUTPUT_DIR, "model.pkl")
    scaler_path = os.path.join(OUTPUT_DIR, "scaler.pkl")
    metadata_path = os.path.join(OUTPUT_DIR, "metadata.json")

    joblib.dump(best_model, model_path)
    joblib.dump(scaler, scaler_path)

    info = extract_model_info(best_model, best_name, scaler, metrics)
    info["all_results"] = all_results

    with open(metadata_path, "w") as f:
        json.dump(info, f, indent=2)

    print(f"\nModel saved to {model_path}")
    print(f"Scaler saved to {scaler_path}")
    print(f"Metadata saved to {metadata_path}")


if __name__ == "__main__":
    main()
