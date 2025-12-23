"""Payment model"""
from sqlalchemy import Column, Integer, Numeric, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from src.core.database import Base


class Pago(Base):
    __tablename__ = "pagos"
    
    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id"), nullable=False)
    monto = Column(Numeric, nullable=False)
    cuenta_origen = Column(String(100), nullable=False)
    fecha_pago = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    pedido = relationship("Pedido", back_populates="pagos")
