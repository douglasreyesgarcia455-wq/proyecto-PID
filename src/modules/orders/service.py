"""Order business logic"""
from sqlalchemy.orm import Session
from fastapi import HTTPException
from src.modules.orders.model import Pedido, DetallePedido
from src.modules.orders.schema import OrderCreate, OrderUpdate
from src.modules.products.model import Producto
from src.modules.clients.model import Cliente
from src.modules.payments.model import Pago
from datetime import datetime
from decimal import Decimal


class OrderService:
    
    @staticmethod
    def get_by_id(db: Session, order_id: int) -> Pedido:
        """Get order by ID"""
        order = db.query(Pedido).filter(Pedido.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return order
    
    @staticmethod
    def list_orders(db: Session, skip: int = 0, limit: int = 100):
        """List all orders"""
        return db.query(Pedido).order_by(Pedido.created_at.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def create_order(db: Session, order_data: OrderCreate) -> Pedido:
        """Create new order with details"""
        # Verify client exists
        client = db.query(Cliente).filter(Cliente.id == order_data.cliente_id).first()
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        # Calculate total and verify stock
        total = Decimal(0)
        detalles_to_create = []
        
        for detalle in order_data.detalles:
            producto = db.query(Producto).filter(Producto.id == detalle.producto_id).first()
            if not producto:
                raise HTTPException(status_code=404, detail=f"Product {detalle.producto_id} not found")
            
            if producto.stock < detalle.cantidad:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for product '{producto.nombre}'. Available: {producto.stock}"
                )
            
            # Use provided price or product price
            precio = detalle.precio_unitario if detalle.precio_unitario else Decimal(str(producto.precio_venta))
            subtotal = precio * detalle.cantidad
            total += subtotal
            
            detalles_to_create.append({
                "producto_id": detalle.producto_id,
                "cantidad": detalle.cantidad,
                "precio_unitario": precio,
                "subtotal": subtotal,
                "producto": producto
            })
        
        # Create order
        estado_inicial = "pagado" if order_data.pago_inmediato else "pendiente"
        total_pagado_inicial = total if order_data.pago_inmediato else Decimal(0)
        
        db_order = Pedido(
            cliente_id=order_data.cliente_id,
            estado=estado_inicial,
            total=total,
            total_pagado=total_pagado_inicial
        )
        db.add(db_order)
        db.flush()
        
        # Create order details and update stock
        for detalle_data in detalles_to_create:
            producto = detalle_data.pop("producto")
            db_detalle = DetallePedido(
                pedido_id=db_order.id,
                **detalle_data
            )
            db.add(db_detalle)
            
            # Update product stock
            producto.stock -= detalle_data["cantidad"]
        
        # Create payment if pago_inmediato
        if order_data.pago_inmediato and order_data.pago:
            db_pago = Pago(
                pedido_id=db_order.id,
                monto=order_data.pago.monto,
                cuenta_origen=order_data.pago.cuenta_origen,
                codigo_transfermovil=order_data.pago.codigo_transfermovil,
                fecha_pago=datetime.utcnow()
            )
            db.add(db_pago)
        
        db.commit()
        db.refresh(db_order)
        return db_order
    
    @staticmethod
    def update_order(db: Session, order_id: int, order_data: OrderUpdate) -> Pedido:
        """Update order"""
        order = OrderService.get_by_id(db, order_id)
        
        if order_data.devolucion_sacar_negocio is not None:
            order.devolucion_sacar_negocio = order_data.devolucion_sacar_negocio
        
        order.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(order)
        return order
    
    @staticmethod
    def check_and_update_order_status(db: Session, order_id: int):
        """Check if order is fully paid and update status"""
        order = OrderService.get_by_id(db, order_id)
        
        if order.total_pagado >= order.total and order.estado == "pendiente":
            order.estado = "pagado"
            order.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(order)
        
        return order
