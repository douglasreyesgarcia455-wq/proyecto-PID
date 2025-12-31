"""Order API routes"""
from fastapi import APIRouter, Depends, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from src.core.database import get_db
from src.core.deps import require_role
from src.modules.orders.schema import OrderCreate, OrderUpdate, OrderResponse
from src.modules.orders.service import OrderService
from src.modules.orders.stats_service import StatsService
from src.modules.orders.export_service import ExportService

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.get("/", response_model=List[OrderResponse])
def list_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "supervisor", "vendedor"]))
):
    """List all orders"""
    return OrderService.list_orders(db, skip, limit)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "supervisor", "vendedor"]))
):
    """Get order by ID"""
    return OrderService.get_by_id(db, order_id)


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "supervisor", "vendedor"]))
):
    """Create new order - decreases product stock automatically"""
    return OrderService.create_order(db, order_data)


@router.patch("/{order_id}", response_model=OrderResponse)
def update_order(
    order_id: int,
    order_data: OrderUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "supervisor"]))
):
    """Update order - Admin and Supervisor only"""
    return OrderService.update_order(db, order_id, order_data)


@router.get("/stats/daily", response_model=dict)
def get_daily_stats(
    target_date: date = None,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "supervisor", "vendedor"]))
):
    """Get daily sales statistics"""
    return StatsService.get_daily_sales(db, target_date)


@router.get("/stats/pending-summary", response_model=dict)
def get_pending_summary(
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "supervisor", "vendedor"]))
):
    """Get summary of pending orders"""
    return StatsService.get_pending_orders_summary(db)


@router.get("/stats/monthly", response_model=dict)
def get_monthly_stats(
    year: int = None,
    month: int = None,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "supervisor"]))
):
    """Get monthly sales statistics"""
    return StatsService.get_monthly_sales(db, year, month)


@router.get("/export/summary-pdf")
def export_summary_pdf(
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "supervisor", "vendedor"]))
):
    """Export summary report to PDF"""
    # Get all data
    stats = StatsService.get_daily_sales(db)
    low_stock = StatsService.get_low_stock_products(db)
    pending_summary = StatsService.get_pending_orders_summary(db)
    
    # Generate PDF
    pdf_buffer = ExportService.generate_summary_pdf(stats, low_stock, pending_summary)
    
    # Return as downloadable file
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=resumen_{date.today().isoformat()}.pdf"}
    )


@router.get("/export/summary-excel")
def export_summary_excel(
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "supervisor", "vendedor"]))
):
    """Export summary report to Excel"""
    # Get all data
    stats = StatsService.get_daily_sales(db)
    low_stock = StatsService.get_low_stock_products(db)
    pending_summary = StatsService.get_pending_orders_summary(db)
    
    # Generate Excel
    excel_buffer = ExportService.generate_summary_excel(stats, low_stock, pending_summary)
    
    # Return as downloadable file
    return StreamingResponse(
        excel_buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=resumen_{date.today().isoformat()}.xlsx"}
    )
