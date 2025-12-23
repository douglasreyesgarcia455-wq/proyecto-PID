"""Script to create initial admin user"""
import sys
sys.path.append('.')

from sqlalchemy.orm import Session
from src.core.database import SessionLocal
from src.modules.users.model import Usuario
from src.core.security import get_password_hash


def create_admin():
    db: Session = SessionLocal()
    
    try:
        # Check if admin already exists
        existing_admin = db.query(Usuario).filter(Usuario.username == "admin").first()
        if existing_admin:
            print("❌ Admin user already exists")
            return
        
        # Create admin user
        admin = Usuario(
            username="admin",
            email="admin@example.com",
            hashed_password=get_password_hash("admin123"),
            rol="admin",
            is_active=True
        )
        
        db.add(admin)
        db.commit()
        
        print("✅ Admin user created successfully")
        print("   Username: admin")
        print("   Password: admin123")
        print("   ⚠️  CHANGE PASSWORD IN PRODUCTION!")
        
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    create_admin()
