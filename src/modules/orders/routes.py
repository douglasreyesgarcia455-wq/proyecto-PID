"""Order API routes"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from src.core.database import get_db
from src.core.deps import require_role
from src.modules.orders.schema import OrderCreate, OrderUpdate, OrderResponse
from src.modules.orders.service import OrderService

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.get("/", response_model=List[OrderResponse])
def list_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "supervisor", "vendedor"]))
):
    """List all orders"""
    return OrderService.list_orders(db, skip, limit)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "supervisor", "vendedor"]))
):
    """Get order by ID"""
    return OrderService.get_by_id(db, order_id)


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "supervisor", "vendedor"]))
):
    """Create new order - decreases product stock automatically"""
    return OrderService.create_order(db, order_data)


@router.patch("/{order_id}", response_model=OrderResponse)
def update_order(
    order_id: int,
    order_data: OrderUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "supervisor"]))
):
    """Update order - Admin and Supervisor only"""
    return OrderService.update_order(db, order_id, order_data)
