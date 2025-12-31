"""Product business logic"""
from sqlalchemy.orm import Session
from src.modules.products.model import Producto
from src.modules.products.schema import ProductCreate, ProductUpdate
from src.core.base_service import BaseService


class ProductService:
    base = BaseService(Producto)
    
    @staticmethod
    def get_by_id(db: Session, product_id: int) -> Producto:
        return ProductService.base.get_by_id(db, product_id, "Product not found")
    
    @staticmethod
    def list_products(db: Session, skip: int = 0, limit: int = 100):
        return ProductService.base.list_all(db, skip, limit)
    
    @staticmethod
    def list_public_catalog(db: Session):
        return db.query(Producto).filter(Producto.stock > 0).all()
    
    @staticmethod
    def create_product(db: Session, product_data: ProductCreate) -> Producto:
        return ProductService.base.create(db, product_data.model_dump())
    
    @staticmethod
    def update_product(db: Session, product_id: int, product_data: ProductUpdate) -> Producto:
        return ProductService.base.update(db, product_id, product_data.model_dump(exclude_unset=True))
    
    @staticmethod
    def delete_product(db: Session, product_id: int):
        return ProductService.base.delete(db, product_id)
    
    @staticmethod
    def check_low_stock(db: Session):
        return db.query(Producto).filter(Producto.stock <= Producto.stock_minimo).all()
