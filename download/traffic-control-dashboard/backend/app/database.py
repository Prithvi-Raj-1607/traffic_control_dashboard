"""
Database configuration module.
Sets up SQLAlchemy engine, session factory, and dependency injection.
"""

import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# ── Database Configuration ──
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "your_password")
DB_NAME = os.getenv("DB_NAME", "traffic_warehouse")

DATABASE_URL = (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    "?charset=utf8mb4"
)

# ── Engine & Session ──
engine = None
SessionLocal = None
_db_available = False


def _init_engine():
    """Initialise the SQLAlchemy engine; set _db_available flag."""
    global engine, SessionLocal, _db_available
    try:
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=3600,
            echo=False,
            connect_args={"connect_timeout": 5},
        )
        # Quick connectivity test
        with engine.connect() as conn:
            conn.execute(conn.connection.cursor().__class__("SELECT 1"))
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        _db_available = True
        logger.info("MySQL database connection established.")
    except Exception as exc:
        logger.warning("MySQL not available (%s). Falling back to CSV data.", exc)
        engine = None
        SessionLocal = None
        _db_available = False


def is_db_available() -> bool:
    """Return True if MySQL is reachable."""
    return _db_available


# Defer engine creation until first request (lazy init)
_engine_initialized = False


def ensure_engine():
    """Lazily initialise the engine on first call."""
    global _engine_initialized
    if not _engine_initialized:
        _init_engine()
        _engine_initialized = True


# ── Declarative Base ──
Base = declarative_base()


# ── FastAPI Dependency ──
def get_db():
    """Yield a database session; close after request."""
    ensure_engine()
    if not _db_available or SessionLocal is None:
        yield None
        return
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
