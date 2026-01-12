"""Devoluciones routes"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from src.core.deps import get_db, get_current_user
from src.modules.devoluciones.service import DevolucionService
from src.modules.devoluciones.schema import DevolucionCreate, DevolucionResponse
from src.modules.users.model import Usuario

router = APIRouter(prefix="/devoluciones", tags=["devoluciones"])


@router.post("/", response_model=DevolucionResponse, status_code=201)
def crear_devolucion(
    devolucion: DevolucionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Crear una devolución de pedido.
    Requiere rol: admin o supervisor
    """
    if current_user.rol not in ["admin", "supervisor"]:
        raise HTTPException(status_code=403, detail="No tiene permisos para realizar devoluciones")
    
    return DevolucionService.crear_devolucion(db, devolucion, current_user.id)


@router.get("/pedido/{pedido_id}", response_model=DevolucionResponse)
def obtener_devolucion_por_pedido(
    pedido_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtener la devolución de un pedido específico"""
    return DevolucionService.obtener_devolucion_por_pedido(db, pedido_id)


@router.get("/", response_model=List[DevolucionResponse])
def listar_devoluciones(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Listar todas las devoluciones.
    Requiere rol: admin o supervisor
    """
    if current_user.rol not in ["admin", "supervisor"]:
        raise HTTPException(status_code=403, detail="No tiene permisos para ver devoluciones")
    
    return DevolucionService.listar_devoluciones(db, skip, limit)
