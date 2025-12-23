"""Client schemas"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class ContactoBase(BaseModel):
    tipo: str = Field(..., pattern="^(telefono|email)$")
    valor: str = Field(..., min_length=1, max_length=100)


class ContactoCreate(ContactoBase):
    pass


class ContactoResponse(ContactoBase):
    id: int
    cliente_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class ClientBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=200)
    calle: str = Field(..., max_length=200)
    municipio: str = Field(..., max_length=100)
    provincia: str = Field(..., max_length=100)
    localidad: Optional[str] = Field(None, max_length=100)
    es_mipyme: bool = False
    cuenta_de_pago: Optional[str] = Field(None, max_length=100)


class ClientCreate(ClientBase):
    contactos: List[ContactoCreate] = []


class ClientUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=1, max_length=200)
    calle: Optional[str] = Field(None, max_length=200)
    municipio: Optional[str] = Field(None, max_length=100)
    provincia: Optional[str] = Field(None, max_length=100)
    localidad: Optional[str] = Field(None, max_length=100)
    es_mipyme: Optional[bool] = None
    cuenta_de_pago: Optional[str] = Field(None, max_length=100)


class ClientResponse(ClientBase):
    id: int
    created_at: datetime
    updated_at: datetime
    contactos: List[ContactoResponse] = []
    
    class Config:
        from_attributes = True
