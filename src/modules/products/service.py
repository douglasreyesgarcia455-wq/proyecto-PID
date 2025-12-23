"""Product business logic"""
from sqlalchemy.orm import Session
from fastapi import HTTPException
from src.modules.products.model import Producto
from src.modules.products.schema import ProductCreate, ProductUpdate
from datetime import datetime


class ProductService:
    
    @staticmethod
    def get_by_id(db: Session, product_id: int) -> Producto:
        """Get product by ID"""
        product = db.query(Producto).filter(Producto.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product
    
    @staticmethod
    def list_products(db: Session, skip: int = 0, limit: int = 100):
        """List all products"""
        return db.query(Producto).offset(skip).limit(limit).all()
    
    @staticmethod
    def list_public_catalog(db: Session):
        """List products with stock > 0 for public catalog"""
        return db.query(Producto).filter(Producto.stock > 0).all()
    
    @staticmethod
    def create_product(db: Session, product_data: ProductCreate) -> Producto:
        """Create new product"""
        db_product = Producto(**product_data.model_dump())
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product
    
    @staticmethod
    def update_product(db: Session, product_id: int, product_data: ProductUpdate) -> Producto:
        """Update product"""
        product = ProductService.get_by_id(db, product_id)
        
        update_data = product_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(product, field, value)
        
        product.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(product)
        return product
    
    @staticmethod
    def delete_product(db: Session, product_id: int):
        """Delete product"""
        product = ProductService.get_by_id(db, product_id)
        db.delete(product)
        db.commit()
        return {"message": "Product deleted successfully"}
    
    @staticmethod
    def check_low_stock(db: Session):
        """Get products with stock below minimum"""
        return db.query(Producto).filter(Producto.stock <= Producto.stock_minimo).all()
