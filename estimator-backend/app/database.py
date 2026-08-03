import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.history import Base

DATABASE_URL = os.getenv(
    "DATABASE_URL", "mysql+pymysql://estimator:estimator@mysql:3306/estimator"
)

engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    pool_recycle=3600,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
