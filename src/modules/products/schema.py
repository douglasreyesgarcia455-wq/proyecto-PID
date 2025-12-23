"""Product schemas"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from decimal import Decimal


class ProductBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=200)
    descripcion: Optional[str] = None
    precio_venta: Decimal = Field(..., gt=0)
    stock: int = Field(..., ge=0)
    stock_minimo: int = Field(default=5, ge=0)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=1, max_length=200)
    descripcion: Optional[str] = None
    precio_venta: Optional[Decimal] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)
    stock_minimo: Optional[int] = Field(None, ge=0)


class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
