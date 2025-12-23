"""Security utilities for authentication and authorization"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from src.config.settings import get_settings

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    # Truncate password to 72 bytes for bcrypt compatibility
    plain_password = plain_password[:72]
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    # Truncate password to 72 bytes for bcrypt compatibility
    password = password[:72]
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and verify JWT token"""
    try:
        print(f"[DEBUG] Decoding token: {token[:50]}...")
        print(f"[DEBUG] SECRET_KEY: {settings.SECRET_KEY[:20]}...")
        print(f"[DEBUG] ALGORITHM: {settings.ALGORITHM}")
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        print(f"[DEBUG] Decoded successfully: {payload}")
        return payload
    except JWTError as e:
        print(f"[DEBUG] JWT Error: {e}")
        return None
    except Exception as e:
        print(f"[DEBUG] Unexpected error: {e}")
        return None
