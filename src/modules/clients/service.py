"""Client business logic"""
from sqlalchemy.orm import Session
from fastapi import HTTPException
from src.modules.clients.model import Cliente, ContactoCliente
from src.modules.clients.schema import ClientCreate, ClientUpdate
from datetime import datetime


class ClientService:
    
    @staticmethod
    def get_by_id(db: Session, client_id: int) -> Cliente:
        """Get client by ID with contacts"""
        try:
            client = db.query(Cliente).filter(Cliente.id == client_id).first()
            if not client:
                raise HTTPException(status_code=404, detail="Cliente no encontrado")
            return client
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al obtener cliente: {str(e)}")
    
    @staticmethod
    def list_clients(db: Session, skip: int = 0, limit: int = 10):
        """List clients with pagination"""
        try:
            return db.query(Cliente).offset(skip).limit(limit).all()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al listar clientes: {str(e)}")
    
    @staticmethod
    def create_client(db: Session, client_data: ClientCreate) -> Cliente:
        """Create new client with contacts"""
        try:
            # Create client
            client_dict = client_data.model_dump(exclude={"contactos"})
            db_client = Cliente(**client_dict)
            db.add(db_client)
            db.flush()
            
            # Create contacts
            for contacto in client_data.contactos:
                db_contacto = ContactoCliente(
                    cliente_id=db_client.id,
                    tipo=contacto.tipo,
                    valor=contacto.valor
                )
                db.add(db_contacto)
            
            db.commit()
            db.refresh(db_client)
            return db_client
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Error al crear cliente: {str(e)}")
    
    @staticmethod
    def update_client(db: Session, client_id: int, client_data: ClientUpdate) -> Cliente:
        """Update client"""
        try:
            client = ClientService.get_by_id(db, client_id)
            
            update_data = client_data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(client, field, value)
            
            client.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(client)
            return client
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Error al actualizar cliente: {str(e)}")
    
    @staticmethod
    def delete_client(db: Session, client_id: int):
        """Delete client"""
        try:
            client = ClientService.get_by_id(db, client_id)
            db.delete(client)
            db.commit()
            return {"message": "Cliente eliminado exitosamente"}
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Error al eliminar cliente: {str(e)}")
