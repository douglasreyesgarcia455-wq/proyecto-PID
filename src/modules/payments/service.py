"""Payment business logic"""
from sqlalchemy.orm import Session
from fastapi import HTTPException
from src.modules.payments.model import Pago
from src.modules.payments.schema import PaymentCreate
from src.modules.orders.model import Pedido
from src.modules.orders.service import OrderService
from decimal import Decimal


class PaymentService:
    
    @staticmethod
    def get_by_id(db: Session, payment_id: int) -> Pago:
        """Get payment by ID"""
        payment = db.query(Pago).filter(Pago.id == payment_id).first()
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        return payment
    
    @staticmethod
    def list_payments_by_order(db: Session, order_id: int):
        """List all payments for an order"""
        return db.query(Pago).filter(Pago.pedido_id == order_id).all()
    
    @staticmethod
    def create_payment(db: Session, payment_data: PaymentCreate) -> Pago:
        """Create new payment and update order status"""
        # Verify order exists
        order = db.query(Pedido).filter(Pedido.id == payment_data.pedido_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Check if order is already fully paid
        if order.estado == "pagado":
            raise HTTPException(status_code=400, detail="Order is already fully paid")
        
        # Check if payment exceeds remaining amount
        remaining = order.total - order.total_pagado
        if payment_data.monto > remaining:
            raise HTTPException(
                status_code=400,
                detail=f"Payment amount exceeds remaining balance. Remaining: {remaining}"
            )
        
        # Create payment
        db_payment = Pago(**payment_data.model_dump())
        db.add(db_payment)
        
        # Update order total_pagado
        order.total_pagado += payment_data.monto
        
        db.commit()
        db.refresh(db_payment)
        
        # Check and update order status
        OrderService.check_and_update_order_status(db, order.id)
        
        return db_payment
    
    @staticmethod
    def get_order_payment_summary(db: Session, order_id: int):
        """Get payment summary for an order"""
        order = OrderService.get_by_id(db, order_id)
        payments = PaymentService.list_payments_by_order(db, order_id)
        
        return {
            "order_id": order.id,
            "total": float(order.total),
            "total_pagado": float(order.total_pagado),
            "saldo_pendiente": float(order.total - order.total_pagado),
            "estado": order.estado,
            "cantidad_pagos": len(payments),
            "pagos": payments
        }
