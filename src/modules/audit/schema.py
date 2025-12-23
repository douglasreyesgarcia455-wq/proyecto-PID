"""AuditLog schemas"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AuditLogResponse(BaseModel):
    id: int
    usuario_id: Optional[int]
    endpoint: str
    metodo_http: str
    payload: Optional[dict]
    ip_address: Optional[str]
    user_agent: Optional[str]
    status_code: Optional[int]
    response_time_ms: Optional[int]
    created_at: datetime
    # Usuario info
    username: Optional[str] = None
    
    class Config:
        from_attributes = True
