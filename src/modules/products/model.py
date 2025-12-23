"""Producto model"""
from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime
from datetime import datetime
from src.core.database import Base


class Producto(Base):
    __tablename__ = "productos"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=True)
    precio_venta = Column(Numeric, nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    stock_minimo = Column(Integer, nullable=False, default=5)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
