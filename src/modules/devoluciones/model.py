"""Devoluciones models"""
from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from src.core.database import Base


class Devolucion(Base):
    __tablename__ = "devoluciones"
    
    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id", ondelete="CASCADE"), nullable=False, unique=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    motivo = Column(String(500), nullable=False)
    descripcion = Column(Text, nullable=True)
    fecha_devolucion = Column(DateTime, default=datetime.utcnow, nullable=False)
    productos_devueltos = Column(JSON, nullable=False)  # [{producto_id, cantidad, precio, nombre}]
    monto_total = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    pedido = relationship("Pedido", backref="devolucion")
    usuario = relationship("Usuario")
