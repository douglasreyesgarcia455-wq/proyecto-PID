"""Order models"""
from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from src.core.database import Base


class Pedido(Base):
    __tablename__ = "pedidos"
    
    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    fecha_pedido = Column(DateTime, default=datetime.utcnow, nullable=False)
    estado = Column(String(9), nullable=False, default="pendiente")  # pendiente, pagado
    total = Column(Numeric, nullable=False)
    total_pagado = Column(Numeric, nullable=False, default=0)
    devolucion_sacar_negocio = Column(Boolean, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    cliente = relationship("Cliente", back_populates="pedidos")
    detalles = relationship("DetallePedido", back_populates="pedido", cascade="all, delete-orphan")
    pagos = relationship("Pago", back_populates="pedido", cascade="all, delete-orphan")


class DetallePedido(Base):
    __tablename__ = "detalles_pedido"
    
    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id"), nullable=False)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Numeric, nullable=False)
    subtotal = Column(Numeric, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    pedido = relationship("Pedido", back_populates="detalles")
    producto = relationship("Producto")
