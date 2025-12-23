"""Cliente models"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from src.core.database import Base


class Cliente(Base):
    __tablename__ = "clientes"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(200), nullable=False)
    calle = Column(String(200), nullable=False)
    municipio = Column(String(100), nullable=False)
    provincia = Column(String(100), nullable=False)
    localidad = Column(String(100), nullable=True)
    es_mipyme = Column(Boolean, nullable=False, default=False)
    cuenta_de_pago = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    contactos = relationship("ContactoCliente", back_populates="cliente", cascade="all, delete-orphan")


class ContactoCliente(Base):
    __tablename__ = "contactos_clientes"
    
    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    tipo = Column(String(8), nullable=False)  # telefono, email
    valor = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    cliente = relationship("Cliente", back_populates="contactos")
