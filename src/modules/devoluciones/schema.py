"""Devoluciones schemas"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional


class ProductoDevuelto(BaseModel):
    """Producto incluido en la devolución"""
    producto_id: int
    nombre: str
    cantidad: int
    precio: float


class DevolucionCreate(BaseModel):
    """Schema para crear una devolución"""
    pedido_id: int
    motivo: str = Field(..., min_length=5, max_length=500)
    descripcion: Optional[str] = None


class DevolucionResponse(BaseModel):
    """Schema de respuesta de devolución"""
    id: int
    pedido_id: int
    usuario_id: int
    motivo: str
    descripcion: Optional[str]
    fecha_devolucion: datetime
    productos_devueltos: List[ProductoDevuelto]
    monto_total: float
    created_at: datetime
    
    class Config:
        from_attributes = True
