"""Order schemas"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from decimal import Decimal


class DetalleBase(BaseModel):
    producto_id: int
    cantidad: int = Field(..., gt=0)


class DetalleCreate(DetalleBase):
    precio_unitario: Optional[Decimal] = None  # Optional, se tomará del producto si no se provee


class PagoInmediato(BaseModel):
    """Payment data for immediate payment"""
    monto: Decimal
    cuenta_origen: str
    codigo_transfermovil: str = Field(..., alias="codigo_transfermovil")


class DetalleResponse(DetalleBase):
    id: int
    pedido_id: int
    precio_unitario: Decimal
    subtotal: Decimal
    created_at: datetime
    
    class Config:
        from_attributes = True


class OrderBase(BaseModel):
    cliente_id: int


class OrderCreate(OrderBase):
    detalles: List[DetalleCreate] = Field(..., min_length=1)
    pago_inmediato: bool = False
    pago: Optional[PagoInmediato] = None


class OrderUpdate(BaseModel):
    devolucion_sacar_negocio: Optional[bool] = None


class OrderResponse(OrderBase):
    id: int
    fecha_pedido: datetime
    estado: str
    total: Decimal
    total_pagado: Decimal
    devolucion_sacar_negocio: Optional[bool]
    created_at: datetime
    updated_at: datetime
    detalles: List[DetalleResponse] = []
    
    class Config:
        from_attributes = True
