import sys
import os

# Add backend to path so we can import from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal, engine
from app.models.domain import Base
from app.db.seed import reset_db

def main():
    print("Creating tables if they don't exist...")
    Base.metadata.create_all(bind=engine)
    
    print("Connecting to DB...")
    db = SessionLocal()
    try:
        print("Seeding database...")
        run_id = reset_db(db)
        print(f"Database seeded successfully. Primary run_id: {run_id}")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
