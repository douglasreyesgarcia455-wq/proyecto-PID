"""Dependencies for FastAPI routes"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.security import decode_access_token
from src.modules.users.model import Usuario

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Usuario:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    print(f"[DEBUG] Decoded payload: {payload}")
    
    if payload is None:
        print("[DEBUG] Payload is None")
        raise credentials_exception
    
    user_id = payload.get("sub")
    print(f"[DEBUG] User ID from token: {user_id} (type: {type(user_id)})")
    
    if user_id is None:
        print("[DEBUG] User ID is None")
        raise credentials_exception
    
    # Convert to int if it's a string
    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        print(f"[DEBUG] Could not convert user_id to int: {user_id}")
        raise credentials_exception
    
    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    print(f"[DEBUG] User from DB: {user}")
    
    if user is None:
        print("[DEBUG] User not found in DB")
        raise credentials_exception
    
    if not user.is_active:
        print("[DEBUG] User is not active")
        raise HTTPException(status_code=400, detail="Inactive user")
    
    print(f"[DEBUG] User authenticated: {user.username}")
    return user


def require_role(allowed_roles: list[str]):
    """Dependency to check user role"""
    def role_checker(current_user: Usuario = Depends(get_current_user)):
        print(f"[DEBUG] Checking role - User: {current_user.username}")
        print(f"[DEBUG] User role: '{current_user.rol}' (type: {type(current_user.rol)})")
        print(f"[DEBUG] Allowed roles: {allowed_roles}")
        
        # Case-insensitive role comparison
        user_rol_lower = current_user.rol.lower()
        allowed_roles_lower = [r.lower() for r in allowed_roles]
        
        print(f"[DEBUG] Role in allowed? {user_rol_lower in allowed_roles_lower}")
        
        if user_rol_lower not in allowed_roles_lower:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied. Required roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker
