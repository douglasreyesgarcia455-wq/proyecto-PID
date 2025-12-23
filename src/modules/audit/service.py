"""AuditLog service"""
from sqlalchemy.orm import Session, joinedload
from src.modules.audit.model import AuditLog
from src.modules.users.model import Usuario
from typing import List


class AuditService:
    """Service for audit log operations"""
    
    @staticmethod
    def list_logs(db: Session, skip: int = 0, limit: int = 100) -> List[AuditLog]:
        """List all audit logs with pagination"""
        try:
            logs = db.query(AuditLog)\
                .options(joinedload(AuditLog.usuario))\
                .order_by(AuditLog.created_at.desc())\
                .offset(skip)\
                .limit(limit)\
                .all()
            
            # Add username to logs
            for log in logs:
                if log.usuario:
                    log.username = log.usuario.username
            
            return logs
        except Exception as e:
            raise Exception(f"Error al listar logs: {str(e)}")
    
    @staticmethod
    def filter_logs(
        db: Session,
        usuario_id: int = None,
        metodo_http: str = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[AuditLog]:
        """Filter audit logs"""
        try:
            query = db.query(AuditLog).options(joinedload(AuditLog.usuario))
            
            if usuario_id:
                query = query.filter(AuditLog.usuario_id == usuario_id)
            
            if metodo_http:
                query = query.filter(AuditLog.metodo_http == metodo_http)
            
            logs = query.order_by(AuditLog.created_at.desc())\
                .offset(skip)\
                .limit(limit)\
                .all()
            
            # Add username to logs
            for log in logs:
                if log.usuario:
                    log.username = log.usuario.username
            
            return logs
        except Exception as e:
            raise Exception(f"Error al filtrar logs: {str(e)}")
    
    @staticmethod
    def get_user_logs(db: Session, usuario_id: int, skip: int = 0, limit: int = 100) -> List[AuditLog]:
        """Get logs for specific user"""
        try:
            logs = db.query(AuditLog)\
                .options(joinedload(AuditLog.usuario))\
                .filter(AuditLog.usuario_id == usuario_id)\
                .order_by(AuditLog.created_at.desc())\
                .offset(skip)\
                .limit(limit)\
                .all()
            
            # Add username to logs
            for log in logs:
                if log.usuario:
                    log.username = log.usuario.username
            
            return logs
        except Exception as e:
            raise Exception(f"Error al obtener logs del usuario: {str(e)}")
