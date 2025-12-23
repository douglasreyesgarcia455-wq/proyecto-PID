"""Create sample products for testing"""
from src.core.database import SessionLocal
from src.modules.products.model import Producto
from decimal import Decimal

def create_sample_products():
    db = SessionLocal()
    try:
        # Check if products already exist
        existing = db.query(Producto).count()
        if existing > 0:
            print(f"Ya existen {existing} productos en la base de datos")
            return
        
        # Sample products
        products = [
            Producto(
                nombre="Laptop Dell Inspiron 15",
                descripcion="Laptop para trabajo y estudio, 8GB RAM, 256GB SSD",
                precio_venta=Decimal("850.00"),
                stock=15,
                stock_minimo=5
            ),
            Producto(
                nombre="Mouse Logitech M185",
                descripcion="Mouse inalámbrico ergonómico",
                precio_venta=Decimal("12.50"),
                stock=50,
                stock_minimo=10
            ),
            Producto(
                nombre="Teclado Mecánico RGB",
                descripcion="Teclado mecánico con iluminación RGB",
                precio_venta=Decimal("65.00"),
                stock=25,
                stock_minimo=8
            ),
            Producto(
                nombre="Monitor LG 24 pulgadas",
                descripcion="Monitor Full HD IPS 24 pulgadas",
                precio_venta=Decimal("180.00"),
                stock=12,
                stock_minimo=5
            ),
            Producto(
                nombre="Webcam Logitech C920",
                descripcion="Webcam Full HD 1080p para videoconferencias",
                precio_venta=Decimal("75.00"),
                stock=8,
                stock_minimo=5
            ),
            Producto(
                nombre="Auriculares Sony WH-1000XM4",
                descripcion="Auriculares con cancelación de ruido",
                precio_venta=Decimal("299.00"),
                stock=3,
                stock_minimo=5
            ),
            Producto(
                nombre="Disco Duro Externo 1TB",
                descripcion="Disco duro portátil USB 3.0",
                precio_venta=Decimal("55.00"),
                stock=30,
                stock_minimo=10
            ),
            Producto(
                nombre="Cable HDMI 2m",
                descripcion="Cable HDMI 2.0 de alta velocidad",
                precio_venta=Decimal("8.50"),
                stock=100,
                stock_minimo=20
            ),
            Producto(
                nombre="Hub USB 3.0 de 4 puertos",
                descripcion="Expansor USB con 4 puertos USB 3.0",
                precio_venta=Decimal("18.00"),
                stock=40,
                stock_minimo=10
            ),
            Producto(
                nombre="Pad de Enfriamiento para Laptop",
                descripcion="Base refrigeradora con ventiladores",
                precio_venta=Decimal("22.00"),
                stock=20,
                stock_minimo=5
            ),
        ]
        
        for product in products:
            db.add(product)
        
        db.commit()
        print(f"✅ Se crearon {len(products)} productos de prueba exitosamente")
        
        for p in products:
            status = "⚠️ BAJO STOCK" if p.stock <= p.stock_minimo else "✓"
            print(f"  {status} {p.nombre} - Stock: {p.stock} - Precio: ${p.precio_venta}")
    
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_products()
