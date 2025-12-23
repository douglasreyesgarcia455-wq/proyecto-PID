"""User API routes"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from src.core.database import get_db
from src.core.deps import get_current_user, require_role
from src.modules.users.schema import UserCreate, UserUpdate, UserResponse
from src.modules.users.service import UserService
from src.modules.users.model import Usuario

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: Usuario = Depends(get_current_user)):
    """Get current user information"""
    return current_user


@router.get("/", response_model=List[UserResponse])
def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"]))
):
    """List all users - Admin only"""
    return UserService.list_users(db, skip, limit)


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"]))
):
    """Get user by ID - Admin only"""
    return UserService.get_by_id(db, user_id)


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"]))
):
    """Create new user - Admin only"""
    return UserService.create_user(db, user_data)


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"]))
):
    """Update user - Admin only"""
    return UserService.update_user(db, user_id, user_data)


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"]))
):
    """Deactivate user - Admin only"""
    return UserService.delete_user(db, user_id)
