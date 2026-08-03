"""
Seed Elasticsearch with housing dataset.

Usage:
    python scripts/seed_es.py [--es-url http://localhost:9200] [--csv data/House Price Dataset.csv]
"""

import argparse
import logging
import sys
from typing import Iterator

import pandas as pd
from elasticsearch import Elasticsearch, helpers

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

INDEX_NAME = "properties"

MAPPING = {
    "settings": {"number_of_shards": 1, "number_of_replicas": 0},
    "mappings": {
        "properties": {
            "square_footage": {"type": "integer"},
            "bedrooms": {"type": "float"},
            "bathrooms": {"type": "float"},
            "year_built": {"type": "integer"},
            "lot_size": {"type": "integer"},
            "distance_to_city_center": {"type": "float"},
            "school_rating": {"type": "float"},
            "price": {"type": "float"},
        }
    },
}

RANGES = {
    "square_footage": (100, 50_000),
    "bedrooms": (0, 50),
    "bathrooms": (0, 50),
    "year_built": (1800, 2030),
    "lot_size": (100, 500_000),
    "distance_to_city_center": (0, 500),
    "school_rating": (1, 10),
    "price": (1_000, 100_000_000),
}

REQUIRED_COLS = [
    "id",
    "square_footage",
    "bedrooms",
    "bathrooms",
    "year_built",
    "lot_size",
    "distance_to_city_center",
    "school_rating",
    "price",
]


def read_and_clean(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path)

    missing = [c for c in REQUIRED_COLS if c not in df.columns]
    if missing:
        logger.error("Missing columns: %s", missing)
        sys.exit(1)

    df = df[REQUIRED_COLS].copy()

    for col in REQUIRED_COLS:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    before = len(df)
    df = df.dropna(subset=REQUIRED_COLS)
    logger.info("Dropped %d rows with missing/invalid values", before - len(df))

    for col, (lo, hi) in RANGES.items():
        mask = df[col].between(lo, hi)
        if not mask.all():
            logger.info(
                "Dropped %d rows: %s out of range [%s, %s]",
                (~mask).sum(),
                col,
                lo,
                hi,
            )
            df = df[mask]

    df["id"] = df["id"].astype(int)
    logger.info("Final: %d valid rows", len(df))
    return df


def generate_actions(df: pd.DataFrame) -> Iterator[dict]:
    for _, row in df.iterrows():
        yield {
            "_index": INDEX_NAME,
            "_id": int(row["id"]),
            "_source": {
                "square_footage": int(row["square_footage"]),
                "bedrooms": float(row["bedrooms"]),
                "bathrooms": float(row["bathrooms"]),
                "year_built": int(row["year_built"]),
                "lot_size": int(row["lot_size"]),
                "distance_to_city_center": float(row["distance_to_city_center"]),
                "school_rating": float(row["school_rating"]),
                "price": float(row["price"]),
            },
        }


def main():
    parser = argparse.ArgumentParser(description="Seed Elasticsearch with property data")
    parser.add_argument(
        "--es-url",
        default="http://localhost:9200",
        help="Elasticsearch URL (default: http://localhost:9200)",
    )
    parser.add_argument(
        "--csv",
        default="data/House Price Dataset.csv",
        help="Path to CSV file",
    )
    parser.add_argument(
        "--drop-existing",
        action="store_true",
        help="Delete and recreate the index if it already exists",
    )
    args = parser.parse_args()

    logger.info("Connecting to Elasticsearch at %s", args.es_url)
    es = Elasticsearch(args.es_url)

    if not es.ping():
        logger.error("Cannot reach Elasticsearch at %s", args.es_url)
        sys.exit(1)

    if es.indices.exists(index=INDEX_NAME):
        if args.drop_existing:
            logger.info("Dropping existing index '%s'", INDEX_NAME)
            es.indices.delete(index=INDEX_NAME)
        else:
            logger.info(
                "Index '%s' already exists. Use --drop-existing to recreate.",
                INDEX_NAME,
            )
            sys.exit(0)

    es.indices.create(index=INDEX_NAME, body=MAPPING)
    logger.info("Created index '%s'", INDEX_NAME)

    df = read_and_clean(args.csv)

    success, errors = helpers.bulk(es, generate_actions(df), raise_on_error=False)
    logger.info("Indexed %d documents, %d errors", success, len(errors) if errors else 0)

    if errors:
        for err in errors[:5]:
            logger.warning("  %s", err)


if __name__ == "__main__":
    main()
