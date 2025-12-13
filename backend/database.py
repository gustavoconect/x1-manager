import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Get DB URL from environment (Render/Supabase sets this)
DATABASE_URL = os.getenv("DATABASE_URL")

# Toggle: Use DB if URL exists, otherwise fallback to None (Local JSON mode)
USE_DB = DATABASE_URL is not None

engine = None
SessionLocal = None
Base = declarative_base()

if USE_DB:
    # Fix for Render's postgres:// (SQLAlchemy needs postgresql://)
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
        
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    if not USE_DB:
        return None
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
