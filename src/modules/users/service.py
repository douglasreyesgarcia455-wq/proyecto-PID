"""User business logic"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from src.modules.users.model import Usuario
from src.modules.users.schema import UserCreate, UserUpdate
from src.core.security import get_password_hash
from datetime import datetime


class UserService:
    
    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Usuario:
        """Get user by ID"""
        user = db.query(Usuario).filter(Usuario.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    
    @staticmethod
    def get_by_username(db: Session, username: str) -> Usuario:
        """Get user by username"""
        return db.query(Usuario).filter(Usuario.username == username).first()
    
    @staticmethod
    def get_by_email(db: Session, email: str) -> Usuario:
        """Get user by email"""
        return db.query(Usuario).filter(Usuario.email == email).first()
    
    @staticmethod
    def list_users(db: Session, skip: int = 0, limit: int = 100):
        """List all users"""
        return db.query(Usuario).offset(skip).limit(limit).all()
    
    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> Usuario:
        """Create new user"""
        # Check if username exists
        if UserService.get_by_username(db, user_data.username):
            raise HTTPException(status_code=400, detail="Username already exists")
        
        # Check if email exists
        if UserService.get_by_email(db, user_data.email):
            raise HTTPException(status_code=400, detail="Email already exists")
        
        # Create user
        hashed_password = get_password_hash(user_data.password)
        db_user = Usuario(
            username=user_data.username,
            email=user_data.email,
            hashed_password=hashed_password,
            rol=user_data.rol,
            is_active=True
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def update_user(db: Session, user_id: int, user_data: UserUpdate) -> Usuario:
        """Update user"""
        user = UserService.get_by_id(db, user_id)
        
        if user_data.email and user_data.email != user.email:
            if UserService.get_by_email(db, user_data.email):
                raise HTTPException(status_code=400, detail="Email already exists")
            user.email = user_data.email
        
        if user_data.rol:
            user.rol = user_data.rol
        
        if user_data.is_active is not None:
            user.is_active = user_data.is_active
        
        user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def delete_user(db: Session, user_id: int):
        """Soft delete user by deactivating"""
        user = UserService.get_by_id(db, user_id)
        user.is_active = False
        user.updated_at = datetime.utcnow()
        db.commit()
        return {"message": "User deactivated successfully"}
