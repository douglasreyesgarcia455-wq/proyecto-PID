"""Payment API routes"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from src.core.database import get_db
from src.core.deps import require_role
from src.modules.payments.schema import PaymentCreate, PaymentResponse
from src.modules.payments.service import PaymentService

router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.get("/order/{order_id}", response_model=List[PaymentResponse])
def list_payments_by_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "supervisor", "vendedor"]))
):
    """List all payments for an order"""
    return PaymentService.list_payments_by_order(db, order_id)


@router.get("/order/{order_id}/summary")
def get_order_payment_summary(
    order_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "supervisor", "vendedor"]))
):
    """Get payment summary for an order"""
    return PaymentService.get_order_payment_summary(db, order_id)


@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment(
    payment_data: PaymentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "supervisor", "vendedor"]))
):
    """Register new payment - automatically updates order status if fully paid"""
    return PaymentService.create_payment(db, payment_data)


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "supervisor", "vendedor"]))
):
    """Get payment by ID"""
    return PaymentService.get_by_id(db, payment_id)
