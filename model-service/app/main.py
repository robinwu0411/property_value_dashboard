from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import model_loader
from app.routes.health import router as health_router
from app.routes.model_info import router as model_info_router
from app.routes.predict import router as predict_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    model_loader.load_model()
    yield


app = FastAPI(
    title="Property Value Estimator - Model Service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(model_info_router)
app.include_router(predict_router)
