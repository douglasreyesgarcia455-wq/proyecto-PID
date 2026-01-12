"""Product API routes"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from src.core.database import get_db
from src.core.deps import require_role
from src.modules.products.schema import ProductCreate, ProductUpdate, ProductResponse
from src.modules.products.service import ProductService
from src.modules.orders.stats_service import StatsService

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("/catalog", response_model=List[ProductResponse])
def get_public_catalog(db: Session = Depends(get_db)):
    """Public catalog - no authentication required"""
    return ProductService.list_public_catalog(db)


@router.get("/", response_model=List[ProductResponse])
def list_products(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "supervisor", "vendedor"]))
):
    """List all products - authenticated users"""
    return ProductService.list_products(db, skip, limit)


@router.get("/low-stock", response_model=List[ProductResponse])
def get_low_stock_products(
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "supervisor"]))
):
    """Get products with low stock - Admin and Supervisor only"""
    return ProductService.check_low_stock(db)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "supervisor", "vendedor"]))
):
    """Get product by ID"""
    return ProductService.get_by_id(db, product_id)


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "supervisor"]))
):
    """Create new product - Admin and Supervisor only"""
    return ProductService.create_product(db, product_data)


@router.patch("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "supervisor"]))
):
    """Update product - Admin and Supervisor only"""
    return ProductService.update_product(db, product_id, product_data)


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin"]))
):
    """Delete product - Admin only"""
    return ProductService.delete_product(db, product_id)


@router.get("/alerts/low-stock", response_model=List[dict])
def get_low_stock_alerts(
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "supervisor"]))
):
    """Get products with low stock - Admin and Supervisor only"""
    return StatsService.get_low_stock_products(db)
