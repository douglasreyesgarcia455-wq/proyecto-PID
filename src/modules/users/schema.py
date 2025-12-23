"""User schemas for validation"""
from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    rol: str
    
    @field_validator('rol')
    @classmethod
    def validate_rol(cls, v):
        allowed_roles = ['admin', 'vendedor', 'supervisor']
        if v.lower() not in allowed_roles:
            raise ValueError(f'Rol must be one of: {", ".join(allowed_roles)}')
        return v.lower()


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    rol: Optional[str] = None
    is_active: Optional[bool] = None
    
    @field_validator('rol')
    @classmethod
    def validate_rol(cls, v):
        if v is not None:
            allowed_roles = ['admin', 'vendedor', 'supervisor']
            if v.lower() not in allowed_roles:
                raise ValueError(f'Rol must be one of: {", ".join(allowed_roles)}')
            return v.lower()
        return v


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    rol: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class UserInDB(UserResponse):
    hashed_password: str
