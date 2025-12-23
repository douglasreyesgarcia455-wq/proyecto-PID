"""Client API routes"""
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List
from src.core.database import get_db
from src.core.deps import require_role
from src.modules.clients.schema import ClientCreate, ClientUpdate, ClientResponse
from src.modules.clients.service import ClientService

router = APIRouter(prefix="/api/clients", tags=["clients"])


@router.get("/", response_model=List[ClientResponse])
def list_clients(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "supervisor", "vendedor"]))
):
    """List clients with pagination"""
    try:
        return ClientService.list_clients(db, skip, limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al listar clientes: {str(e)}")


@router.get("/{client_id}", response_model=ClientResponse)
def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "supervisor", "vendedor"]))
):
    """Get client by ID with contacts"""
    try:
        return ClientService.get_by_id(db, client_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener cliente: {str(e)}")


@router.post("/", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(
    client_data: ClientCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "supervisor", "vendedor"]))
):
    """Create new client with contacts"""
    try:
        return ClientService.create_client(db, client_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear cliente: {str(e)}")


@router.patch("/{client_id}", response_model=ClientResponse)
def update_client(
    client_id: int,
    client_data: ClientUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "supervisor", "vendedor"]))
):
    """Update client"""
    try:
        return ClientService.update_client(db, client_id, client_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar cliente: {str(e)}")


@router.delete("/{client_id}")
def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin"]))
):
    """Delete client - Admin only"""
    try:
        return ClientService.delete_client(db, client_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar cliente: {str(e)}")
