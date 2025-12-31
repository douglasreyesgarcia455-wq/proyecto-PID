"""Statistics service for orders and sales"""
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, date
from src.modules.orders.model import Pedido, DetallePedido
from src.modules.payments.model import Pago
from src.modules.products.model import Producto


class StatsService:
    """Service for sales and inventory statistics"""
    
    @staticmethod
    def get_daily_sales(db: Session, target_date: date = None) -> dict:
        """Get sales summary for a specific date"""
        if target_date is None:
            target_date = date.today()
        
        # Get all orders from target date
        orders = db.query(Pedido).filter(
            func.date(Pedido.fecha_pedido) == target_date
        ).all()
        
        total_orders = len(orders)
        total_sales = sum(order.total for order in orders)
        
        # Count by status
        pending_orders = sum(1 for order in orders if order.estado == "pendiente")
        paid_orders = sum(1 for order in orders if order.estado == "pagado")
        
        # Get payments for today
        payments = db.query(Pago).join(Pedido).filter(
            func.date(Pago.fecha_pago) == target_date
        ).all()
        
        total_collected = sum(payment.monto for payment in payments)
        
        return {
            "date": target_date.isoformat(),
            "total_orders": total_orders,
            "total_sales": float(total_sales),
            "total_collected": float(total_collected),
            "pending_orders": pending_orders,
            "paid_orders": paid_orders,
            "payments_count": len(payments)
        }
    
    @staticmethod
    def get_low_stock_products(db: Session) -> list:
        """Get products with stock below minimum"""
        products = db.query(Producto).filter(
            Producto.stock <= Producto.stock_minimo
        ).all()
        
        return [
            {
                "id": p.id,
                "nombre": p.nombre,
                "stock": p.stock,
                "stock_minimo": p.stock_minimo,
                "precio_venta": float(p.precio_venta)
            }
            for p in products
        ]
    
    @staticmethod
    def get_pending_orders_summary(db: Session) -> dict:
        """Get summary of pending orders"""
        pending_orders = db.query(Pedido).filter(
            Pedido.estado == "pendiente"
        ).all()
        
        total_pending_amount = sum(order.total for order in pending_orders)
        
        return {
            "count": len(pending_orders),
            "total_amount": float(total_pending_amount)
        }
    
    @staticmethod
    def get_monthly_sales(db: Session, year: int = None, month: int = None) -> dict:
        """Get sales summary for a specific month"""
        if year is None or month is None:
            today = date.today()
            year = today.year
            month = today.month
        
        # Get all orders from target month
        orders = db.query(Pedido).filter(
            func.extract('year', Pedido.fecha_pedido) == year,
            func.extract('month', Pedido.fecha_pedido) == month
        ).all()
        
        total_sales = sum(order.total for order in orders)
        
        return {
            "year": year,
            "month": month,
            "total_orders": len(orders),
            "total_sales": float(total_sales)
        }
