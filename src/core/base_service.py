"""Base service with common CRUD operations"""
from typing import TypeVar, Generic, Type
from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime

T = TypeVar('T')


class BaseService(Generic[T]):
    """Generic base service for CRUD operations"""
    
    def __init__(self, model: Type[T]):
        self.model = model
    
    def get_by_id(self, db: Session, id: int, error_msg: str = "Resource not found") -> T:
        """Get entity by ID"""
        entity = db.query(self.model).filter(self.model.id == id).first()
        if not entity:
            raise HTTPException(status_code=404, detail=error_msg)
        return entity
    
    def list_all(self, db: Session, skip: int = 0, limit: int = 100):
        """List all entities with pagination"""
        return db.query(self.model).offset(skip).limit(limit).all()
    
    def create(self, db: Session, data: dict) -> T:
        """Create new entity"""
        entity = self.model(**data)
        db.add(entity)
        db.commit()
        db.refresh(entity)
        return entity
    
    def update(self, db: Session, id: int, data: dict) -> T:
        """Update entity"""
        entity = self.get_by_id(db, id)
        for field, value in data.items():
            setattr(entity, field, value)
        
        if hasattr(entity, 'updated_at'):
            entity.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(entity)
        return entity
    
    def delete(self, db: Session, id: int):
        """Delete entity"""
        entity = self.get_by_id(db, id)
        db.delete(entity)
        db.commit()
        return {"message": "Resource deleted successfully"}
