"""Authentication routes"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.modules.auth.schema import LoginRequest, TokenResponse
from src.modules.auth.service import AuthService

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    """Login endpoint - returns JWT token"""
    user = AuthService.authenticate_user(db, credentials.username, credentials.password)
    access_token = AuthService.create_user_token(user)
    
    return TokenResponse(
        access_token=access_token,
        user_id=user.id,
        username=user.username,
        rol=user.rol
    )
