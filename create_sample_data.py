
from sqlalchemy.orm import Session
from database import SessionLocal, create_tables
from models import Operator
from auth import get_password_hash

def create_sample_operator():
    """Create a sample operator for testing - this is now optional for demo purposes only"""
    print("Sample data creation has been disabled.")
    print("Use the admin dashboard to create operators through the web interface.")
    print("If you need a sample operator for testing, uncomment the code below.")
    
    # Commented out to remove demo data
    """
    db = SessionLocal()
    try:
        # Check if operator already exists
        existing_operator = db.query(Operator).filter(Operator.email == "demo@safariexperts.com").first()
        if existing_operator:
            print("Sample operator already exists")
            return
        
        # Create sample operator
        operator = Operator(
            name="Sarah Johnson",
            email="demo@safariexperts.com",
            password_hash=get_password_hash("password123"),
            company="Safari Experts Ltd",
            specializations=["Kenya Safari", "Tanzania Safari", "Wildlife Photography"],
            is_active=True
        )
        
        db.add(operator)
        db.commit()
        print("Sample operator created successfully!")
        print("Email: demo@safariexperts.com")
        print("Password: password123")
        
    except Exception as e:
        print(f"Error creating sample operator: {e}")
        db.rollback()
    finally:
        db.close()
    """

if __name__ == "__main__":
    create_tables()
    create_sample_operator()
