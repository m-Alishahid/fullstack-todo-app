"""
Database connection and session management for the Todo application.

This module handles:
- Sync database engine creation
- Sync Session management
- Table creation and initialization
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from dotenv import load_dotenv
from typing import Generator

# Load environment variables
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError(
        "DATABASE_URL environment variable is not set. "
        "Please configure your .env file with a valid PostgreSQL connection string."
    )

# Ensure the URL is using the psotgresql+psycopg driver (for sync)
# SQLAlchemy 2.0+ supports psycopg 3 in sync mode via postgresql+psycopg://
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

# Create sync engine
engine = create_engine(
    DATABASE_URL,
    echo=True,  # Set to False in production
    pool_pre_ping=True,  # Verify connections before using them
    pool_size=10,
    max_overflow=20,
)

# Create sync session factory
SessionLocal = sessionmaker(
    bind=engine,
    class_=Session,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


def get_session() -> Generator[Session, None, None]:
    """
    Dependency function for FastAPI to inject database sessions.

    Usage in FastAPI routes:
        @app.get("/items")
        def get_items(session: Session = Depends(get_session)):
            ...

    Yields:
        Session: Database session for the request
    """
    with SessionLocal() as session:
        yield session


def create_db_and_tables():
    """
    Create all database tables defined in SQLModel models.

    This should be called on application startup.
    Tables are created only if they don't already exist.
    """
    # Import models to ensure they are registered with SQLModel
    from sqlmodel import SQLModel
    from app.models import User, Task  # noqa: F401

    SQLModel.metadata.create_all(bind=engine)


def close_db():
    """
    Close database connections.

    This should be called on application shutdown.
    """
    engine.dispose()
