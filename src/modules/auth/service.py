"""Authentication business logic"""
from datetime import timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from src.modules.users.model import Usuario
from src.core.security import verify_password, create_access_token
from src.config.settings import get_settings

settings = get_settings()


class AuthService:
    
    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> Usuario:
        """Authenticate user by username and password"""
        user = db.query(Usuario).filter(Usuario.username == username).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User account is inactive"
            )
        
        if not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password"
            )
        
        return user
    
    @staticmethod
    def create_user_token(user: Usuario) -> str:
        """Create access token for user"""
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id), "username": user.username, "rol": user.rol},
            expires_delta=access_token_expires
        )
        return access_token
