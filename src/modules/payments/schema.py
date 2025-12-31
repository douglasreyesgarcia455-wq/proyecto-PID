"""Payment schemas"""
from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
from typing import Optional


class PaymentBase(BaseModel):
    pedido_id: int
    monto: Decimal = Field(..., gt=0)
    cuenta_origen: str = Field(..., min_length=1, max_length=100)
    codigo_transfermovil: Optional[str] = Field(None, max_length=100)


class PaymentCreate(PaymentBase):
    pass


class PaymentResponse(PaymentBase):
    id: int
    fecha_pago: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True
