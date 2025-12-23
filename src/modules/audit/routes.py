"""AuditLog API routes"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from src.core.database import get_db
from src.core.deps import require_role
from src.modules.audit.schema import AuditLogResponse
from src.modules.audit.service import AuditService

router = APIRouter(prefix="/api/audit", tags=["audit"])


@router.get("/logs", response_model=List[AuditLogResponse])
def list_audit_logs(
    skip: int = 0,
    limit: int = 100,
    usuario_id: Optional[int] = Query(None),
    metodo_http: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin"]))
):
    """
    List all audit logs - Admin only
    Filter by usuario_id or metodo_http if provided
    """
    try:
        if usuario_id or metodo_http:
            return AuditService.filter_logs(db, usuario_id, metodo_http, skip, limit)
        return AuditService.list_logs(db, skip, limit)
    except Exception as e:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/users/{usuario_id}/logs", response_model=List[AuditLogResponse])
def get_user_audit_logs(
    usuario_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin"]))
):
    """Get audit logs for specific user - Admin only"""
    try:
        return AuditService.get_user_logs(db, usuario_id, skip, limit)
    except Exception as e:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
