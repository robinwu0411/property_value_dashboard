FROM python:3.12-slim AS builder
WORKDIR /app
COPY model-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY data/ /data/
COPY model-service/train.py .
RUN python train.py

FROM python:3.12-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
COPY model-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY --from=builder /app/model.pkl /app/scaler.pkl /app/metadata.json ./
COPY model-service/app/ ./app/
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
