"""Script para crear un usuario vendedor de prueba"""
import psycopg2
from passlib.context import CryptContext

# Configuración de hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Conexión a la base de datos
conn = psycopg2.connect(
    host='localhost',
    port=5432,
    database='proyecto_gestion_pedidos',
    user='postgres',
    password='YmVzFstF'
)
cursor = conn.cursor()

# Verificar si ya existe un vendedor
cursor.execute("SELECT id, username, rol FROM usuarios WHERE rol ILIKE '%vendedor%'")
vendedor_existente = cursor.fetchone()

if vendedor_existente:
    print(f"✅ Ya existe un usuario vendedor: {vendedor_existente}")
    print(f"   ID: {vendedor_existente[0]}, Username: {vendedor_existente[1]}, Rol: {vendedor_existente[2]}")
else:
    # Crear nuevo usuario vendedor
    username = "vendedor"
    password = "vendedor123"
    rol = "vendedor"
    
    hashed_password = pwd_context.hash(password)
    
    cursor.execute(
        """
        INSERT INTO usuarios (username, password_hash, rol, activo)
        VALUES (%s, %s, %s, %s)
        RETURNING id, username, rol
        """,
        (username, hashed_password, rol, True)
    )
    
    nuevo_vendedor = cursor.fetchone()
    conn.commit()
    
    print(f"✅ Usuario vendedor creado exitosamente:")
    print(f"   ID: {nuevo_vendedor[0]}")
    print(f"   Username: {nuevo_vendedor[1]}")
    print(f"   Password: {password}")
    print(f"   Rol: {nuevo_vendedor[2]}")

# Verificar también si existe supervisor
cursor.execute("SELECT id, username, rol FROM usuarios WHERE rol ILIKE '%supervisor%'")
supervisor_existente = cursor.fetchone()

if supervisor_existente:
    print(f"\n✅ También existe un supervisor: {supervisor_existente[1]} (Rol: {supervisor_existente[2]})")
else:
    print("\n⚠️  No existe un usuario supervisor (puedes crear uno si lo necesitas)")

conn.close()
print("\n🔐 Credenciales para pruebas:")
print("   Admin: admin / admin123")
print("   Vendedor: vendedor / vendedor123")
