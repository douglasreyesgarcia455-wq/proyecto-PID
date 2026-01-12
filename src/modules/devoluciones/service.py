"""Devoluciones service"""
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from src.modules.devoluciones.model import Devolucion
from src.modules.devoluciones.schema import DevolucionCreate
from src.modules.orders.model import Pedido, DetallePedido
from src.modules.products.model import Producto
from src.modules.payments.model import Pago
from datetime import datetime


class DevolucionService:
    """Service for managing devoluciones"""
    
    @staticmethod
    def crear_devolucion(db: Session, devolucion_data: DevolucionCreate, usuario_id: int):
        """
        Crea una devolución y revierte el pedido:
        - Cambia estado del pedido a 'devuelto'
        - Restaura el inventario de productos
        - Elimina los pagos asociados
        - Registra la devolución
        """
        # Verificar que el pedido existe
        pedido = db.query(Pedido).filter(Pedido.id == devolucion_data.pedido_id).first()
        if not pedido:
            raise HTTPException(status_code=404, detail="Pedido no encontrado")
        
        # Verificar que el pedido no está ya devuelto
        if pedido.estado == "devuelto":
            raise HTTPException(status_code=400, detail="Este pedido ya fue devuelto")
        
        # Verificar que no existe ya una devolución para este pedido
        devolucion_existente = db.query(Devolucion).filter(
            Devolucion.pedido_id == devolucion_data.pedido_id
        ).first()
        if devolucion_existente:
            raise HTTPException(status_code=400, detail="Ya existe una devolución para este pedido")
        
        try:
            # 1. Recopilar información de productos para la devolución
            productos_devueltos = []
            for detalle in pedido.detalles:
                producto = db.query(Producto).filter(Producto.id == detalle.producto_id).first()
                productos_devueltos.append({
                    "producto_id": detalle.producto_id,
                    "nombre": producto.nombre if producto else "Producto no encontrado",
                    "cantidad": detalle.cantidad,
                    "precio": float(detalle.precio_unitario)
                })
                
                # 2. Restaurar inventario
                if producto:
                    producto.cantidad += detalle.cantidad
            
            # 3. Eliminar pagos asociados (reversar transacciones)
            pagos = db.query(Pago).filter(Pago.pedido_id == pedido.id).all()
            for pago in pagos:
                db.delete(pago)
            
            # 4. Cambiar estado del pedido a 'devuelto'
            pedido.estado = "devuelto"
            pedido.total_pagado = 0
            pedido.updated_at = datetime.utcnow()
            
            # 5. Crear registro de devolución
            nueva_devolucion = Devolucion(
                pedido_id=devolucion_data.pedido_id,
                usuario_id=usuario_id,
                motivo=devolucion_data.motivo,
                descripcion=devolucion_data.descripcion,
                productos_devueltos=productos_devueltos,
                monto_total=float(pedido.total),
                fecha_devolucion=datetime.utcnow()
            )
            
            db.add(nueva_devolucion)
            db.commit()
            db.refresh(nueva_devolucion)
            
            return nueva_devolucion
            
        except IntegrityError as e:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Error de integridad: {str(e)}")
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Error al crear devolución: {str(e)}")
    
    @staticmethod
    def obtener_devolucion_por_pedido(db: Session, pedido_id: int):
        """Obtiene la devolución asociada a un pedido"""
        devolucion = db.query(Devolucion).filter(
            Devolucion.pedido_id == pedido_id
        ).first()
        
        if not devolucion:
            raise HTTPException(status_code=404, detail="No se encontró devolución para este pedido")
        
        return devolucion
    
    @staticmethod
    def listar_devoluciones(db: Session, skip: int = 0, limit: int = 100):
        """Lista todas las devoluciones"""
        return db.query(Devolucion).order_by(
            Devolucion.fecha_devolucion.desc()
        ).offset(skip).limit(limit).all()
