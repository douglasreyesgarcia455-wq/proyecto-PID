"""Update admin user password"""
from src.core.database import SessionLocal
from src.core.security import get_password_hash
from src.modules.users.model import Usuario

def update_admin_password():
    db = SessionLocal()
    try:
        # Get admin user
        admin = db.query(Usuario).filter(Usuario.username == 'admin').first()
        
        if admin:
            print("Actualizando contraseña de admin...")
            # Update password with proper truncation
            admin.hashed_password = get_password_hash('admin123')
            db.commit()
            print("✅ Contraseña actualizada exitosamente")
            print("   Usuario: admin")
            print("   Contraseña: admin123")
        else:
            print("❌ Usuario admin no encontrado, creando...")
            admin = Usuario(
                username='admin',
                email='admin@example.com',
                hashed_password=get_password_hash('admin123'),
                rol='admin',
                is_active=True
            )
            db.add(admin)
            db.commit()
            print("✅ Usuario admin creado exitosamente")
            print("   Usuario: admin")
            print("   Contraseña: admin123")
    
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_admin_password()
