import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from sqlalchemy import text
from app.database import engine

def test_sync_connection():
    try:
        print("Attempting to connect to database using Sync Engine...")
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print(f"Connection Successful! Result: {result.scalar()}")
        print("✅ Sync database configuration is working correctly.")
        return True
    except Exception as e:
        print(f"❌ Connection Failed: {e}")
        return False

if __name__ == "__main__":
    if test_sync_connection():
        sys.exit(0)
    else:
        sys.exit(1)
