# Property Value Dashboard

Full-stack property valuation platform with ML-powered price prediction, market analytics, and multi-scenario What-If analysis.

## Feature Overview

| Page | Route | Description |
|------|-------|-------------|
| **Estimator** | `/estimator` | Submit property features → get ML-predicted price. View paginated prediction history with server-side sorting and delete. Select up to 5 records for side-by-side comparison. |
| **Market Analysis** | `/market` | Filter properties by price, size, bedrooms, bathrooms, school rating. Summary cards (average, median, min, max), distribution charts, and paginated breakdown table with sorting and CSV/PDF export. |
| **What-If** | `/market/what-if` | Multi-scenario comparison tool. First submission sets the baseline. Each additional scenario shows predicted price and delta (absolute + percentage) vs the baseline. Any scenario can be promoted to baseline. Session-only, no persistence. |

## Architecture

```
┌───────────────────────────────────────────────────────┐
│              Next.js Portal (App Router)              │
│  ┌─────────────────────────────────────────────────┐  │
│  │       Unified Layout (Nav + Error + Loading)    │  │
│  ├──────────────────┬──────────────────────────────┤  │
│  │  App 1: Estimator│    App 2: Market Analysis    │  │
│  │  (Python BE)     │    (Java BE)                 │  │
│  └────────┬─────────┴──────────────┬───────────────┘  │
└───────────┼────────────────────────┼──────────────────┘
            │                        │
     ┌──────▼──────┐          ┌──────▼────────┐
     │ estimator-  │          │   market-     │
     │ backend     │          │   backend     │
     │ (FastAPI)   │          │ (Spring Boot) │
     └──────┬──────┘          └─────────┬─────┘
            │                           │
            │    ┌───────────────┐      │
            └──► │ model-service │◄─────┘
                 │  (FastAPI/ML) │
                 └───────────────┘
                    │         │
               ┌────▼──┐  ┌───▼────┐
               │ MySQL │  │   ES   │
               └───────┘  └────────┘
```

## Tech Stack

| Service | Language | Framework | Port |
|---------|----------|-----------|------|
| `model-service` | Python 3.12+ | FastAPI, scikit-learn | 8000 |
| `estimator-backend` | Python 3.12+ | FastAPI, SQLAlchemy | 8001 |
| `market-backend` | Java 21 | Spring Boot 3.4.4 | 8080 |
| `portal` | Node.js 22 | Next.js 15, Tailwind CSS | 3000 |
| `mysql` | — | MySQL 8.0 | 3306 |
| `elasticsearch` | — | Elasticsearch 8.15 | 9200 |

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 22 (for portal development)

### One-Command Startup

```bash
docker compose up --build
```

### Verify

```bash
# Model service
curl http://localhost:8000/health                        # → {"status":"healthy"}

# Estimator backend
curl http://localhost:8001/health                        # → {"status":"ok"}

# Market backend
curl http://localhost:8080/api/market/health             # → {"status":"ok"}

# Portal
open http://localhost:3000
```

---

## API Endpoints

### model-service (port 8000)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/model-info` | Model type, features, metrics (R², RMSE, MAE), feature importances |
| `POST` | `/predict` | Single price prediction |
| `POST` | `/predict/batch` | Batch price prediction |

Swagger UI: http://localhost:8000/docs

### estimator-backend (port 8001)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/estimate` | Submit property features → get predicted price (auto-saved to history) |


| `GET` | `/api/history` | Paginated prediction history (`?page=1&page_size=20&sort_by=created_at&sort_order=desc`) |
| `GET` | `/api/history/{id}` | Get single history record |
| `DELETE` | `/api/history/{id}` | Soft-delete history record |

Swagger UI: http://localhost:8001/docs

### market-backend (port 8080)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/market/summary` | Filtered aggregate statistics (avg, median, min, max, distributions) |
| `GET` | `/api/market/breakdown` | Paginated, filtered property list (`?page=1&pageSize=20`) |
| `GET` | `/api/market/breakdown/export` | Export filtered results (`?format=csv\|pdf`) |
| `POST` | `/api/market/what-if` | What-If analysis — predicted price comparison for multi-scenario evaluation |
| `GET` | `/api/market/health` | Health check |

**Query Parameters for `summary` / `breakdown` / `export`:**

| Parameter | Type | Example | Notes |
|-----------|------|---------|-------|
| `minPrice` / `maxPrice` | number | `?minPrice=200000&maxPrice=500000` | |
| `minSquareFootage` / `maxSquareFootage` | number | `?minSquareFootage=1000` | |
| `minYearBuilt` / `maxYearBuilt` | number | `?maxYearBuilt=2020` | |
| `minLotSize` / `maxLotSize` | number | | |
| `minDistanceToCityCenter` / `maxDistanceToCityCenter` | number | | |
| `bedrooms` | repeated number | `?bedrooms=2&bedrooms=3` | Exact match (OR'd) |
| `minBedrooms` | number | `?minBedrooms=3` | Range: "3+" (OR'd with `bedrooms`) |
| `bathrooms` | repeated number | `?bathrooms=1&bathrooms=2` | Exact match (OR'd) |
| `minBathrooms` | number | `?minBathrooms=2` | Range: "2+" (OR'd with `bathrooms`) |
| `minSchoolRating` / `maxSchoolRating` | number | `?minSchoolRating=7&maxSchoolRating=9` | |
| `page` / `pageSize` | number | `?page=1&pageSize=20` | |
| `sortBy` / `sortOrder` | string | `?sortBy=price&sortOrder=desc` | Any column key + `asc`/`desc` |

Swagger UI: http://localhost:8080/docs

---

## Examples

### Single Prediction

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "square_footage": 1850,
    "bedrooms": 3,
    "bathrooms": 2,
    "year_built": 1998,
    "lot_size": 7500,
    "distance_to_city_center": 5.6,
    "school_rating": 8.2
  }'
# → {"predicted_price": 265200.0}
```

### Batch Prediction

```bash
curl -X POST http://localhost:8000/predict/batch \
  -H "Content-Type: application/json" \
  -d '{
    "properties": [
      {"square_footage":1250,"bedrooms":2,"bathrooms":1,"year_built":1985,"lot_size":5200,"distance_to_city_center":3.2,"school_rating":7.1},
      {"square_footage":2100,"bedrooms":4,"bathrooms":2.5,"year_built":2005,"lot_size":9200,"distance_to_city_center":7.3,"school_rating":8.5}
    ]
  }'
# → {"predictions":[{"predicted_price":184550.0},{"predicted_price":346550.0}]}
```

### Market Statistics

```bash
curl "http://localhost:8080/api/market/summary?minPrice=200000&bedrooms=3&bedrooms=4"
# → {"totalProperties": 25, "avgPrice": 348200.0, "medianPrice": 342000.0, ...}
```

### What-If Analysis

```bash
curl -X POST http://localhost:8080/api/market/what-if \
  -H "Content-Type: application/json" \
  -d '{
    "squareFootage": 2200,
    "bedrooms": 3,
    "bathrooms": 2,
    "yearBuilt": 2015,
    "lotSize": 6000,
    "distanceToCityCenter": 3.5,
    "schoolRating": 9.0
  }'
# → {"predictedPrice": 412000.0}
```

### Export

```bash
# CSV
curl "http://localhost:8080/api/market/breakdown/export?format=csv" -o properties.csv

# PDF
curl "http://localhost:8080/api/market/breakdown/export?format=pdf" -o properties.pdf
```

---

## Model

- **Algorithm**: RandomForestRegressor (100 estimators)
- **Performance**: R² = 0.995, RMSE = $5,152, MAE = $4,635 (CV R² = 0.986)
- **Features**: square_footage, bedrooms, bathrooms, year_built, lot_size, distance_to_city_center, school_rating
- **Retraining**: `cd model-service && python train.py` — saves `model.pkl`, `scaler.pkl`, `metadata.json`

---

## Environment Variables

| Variable | Service | Default | Description |
|----------|---------|---------|-------------|
| `MODEL_SERVICE_URL` | market-backend, estimator-backend | `http://localhost:8000` | Base URL for model-service |
| `DATABASE_URL` | estimator-backend | `mysql+pymysql://estimator:estimator@mysql:3306/estimator` | MySQL connection string |
| `ELASTICSEARCH_URL` | market-backend | `http://localhost:9200` | Elasticsearch URL |
| `ES_INDEX` | market-backend | `properties` | Elasticsearch index name |

Set via environment or `.env` files. Docker Compose pre-configures these in `docker-compose.yml`.

---

## Project Structure

```
├── docker-compose.yml
├── README.md
├── data/
│   ├── House Price Dataset.csv
│   └── Test Data For Prediction.csv
├── scripts/
│   └── seed_es.py                  # ES data seeding
├── model-service/                  # ML model API (Task 1)
│   ├── Dockerfile
│   ├── train.py
│   ├── model.pkl
│   ├── metadata.json
│   └── app/
│       ├── main.py
│       ├── schemas.py
│       ├── model_loader.py
│       ├── services/
│       └── routes/
├── estimator-backend/              # Python backend (Task 2 App 1)
│   ├── Dockerfile
│   └── app/
│       ├── main.py
│       ├── database.py
│       ├── schemas.py
│       ├── models/
│       ├── repository/
│       ├── clients/
│       └── routes/
├── market-backend/                 # Java backend (Task 2 App 2)
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
├── portal/                         # Next.js frontend
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.ts
│   └── src/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── estimator/
│       │   └── market/
│       ├── components/
│       │   ├── layout/
│       │   ├── estimator/
│       │   ├── market/
│       │   └── ui/
│       ├── hooks/
│       └── lib/
└── mysql/
    └── init.sql
```

---

## Development

```bash
# Model service
cd model-service
uvicorn app.main:app --reload --port 8000

# Estimator backend
cd estimator-backend
uvicorn app.main:app --reload --port 8001

# Market backend
cd market-backend
mvn spring-boot:run

# Portal
cd portal
npm run dev
```

### Running Tests

```bash
# Model service
cd model-service && python -m pytest tests/ -v

# Estimator backend
cd estimator-backend && python -m pytest tests/ -v

# Market backend
cd market-backend && mvn test

# Portal
cd portal && npm run build
```

---

## License

MIT
