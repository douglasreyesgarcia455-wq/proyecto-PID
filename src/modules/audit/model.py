"""AuditLog model - based on existing logs_acciones table"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from src.core.database import Base


class AuditLog(Base):
    __tablename__ = "logs_acciones"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True, index=True)
    endpoint = Column(String(200), nullable=False)
    metodo_http = Column(String(10), nullable=False)
    payload = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(Text, nullable=True)
    status_code = Column(Integer, nullable=True)
    response_time_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Relationship
    usuario = relationship("Usuario", backref="logs")
