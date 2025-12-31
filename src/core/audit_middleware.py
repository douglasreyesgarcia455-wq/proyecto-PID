"""Audit middleware to log all requests"""
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.orm import Session
from src.core.database import SessionLocal
from src.modules.audit.model import AuditLog
from datetime import datetime
import json
import time


class AuditMiddleware(BaseHTTPMiddleware):
    """Middleware to log all API requests to audit log"""
    
    async def dispatch(self, request: Request, call_next):
        # Skip audit for static files, health checks, docs
        excluded_paths = ["/health", "/docs", "/redoc", "/openapi.json"]
        if any(request.url.path.startswith(path) for path in excluded_paths):
            return await call_next(request)
        
        # Record start time
        start_time = time.time()
        
        # Get request details
        endpoint = request.url.path
        method = request.method
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")
        
        # Try to get payload (careful with large files)
        payload = None
        try:
            if method in ["POST", "PATCH", "PUT"]:
                # Clone body for logging
                body = await request.body()
                # Reset body for route handler
                request._body = body
                
                # Try to parse JSON
                if body and len(body) < 10000:  # Max 10KB for logging
                    try:
                        payload = json.loads(body.decode())
                        # Remove sensitive fields
                        if isinstance(payload, dict):
                            for sensitive in ["password", "token", "secret"]:
                                if sensitive in payload:
                                    payload[sensitive] = "***REDACTED***"
                    except:
                        payload = {"_note": "Binary or non-JSON data"}
        except Exception as e:
            payload = {"_error": f"Could not parse payload: {str(e)}"}
        
        # Get usuario_id from token if available
        usuario_id = None
        try:
            # Extract token from Authorization header
            auth_header = request.headers.get("authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
                # Decode token to get user_id
                from src.core.security import decode_access_token
                payload = decode_access_token(token)
                if payload and "sub" in payload:
                    try:
                        usuario_id = int(payload["sub"])
                    except (ValueError, TypeError):
                        pass
        except Exception as e:
            print(f"Error extracting user_id from token: {str(e)}")
        
        # Process request
        response = await call_next(request)
        
        # Calculate response time
        response_time_ms = int((time.time() - start_time) * 1000)
        
        # Log to database in background
        try:
            db = SessionLocal()
            try:
                audit_log = AuditLog(
                    usuario_id=usuario_id,
                    endpoint=endpoint,
                    metodo_http=method,
                    payload=payload,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    status_code=response.status_code,
                    response_time_ms=response_time_ms,
                    created_at=datetime.utcnow()
                )
                db.add(audit_log)
                db.commit()
            finally:
                db.close()
        except Exception as e:
            # Don't fail request if audit logging fails
            print(f"Audit log error: {str(e)}")
        
        return response
