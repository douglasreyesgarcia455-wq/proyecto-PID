"""Check admin user password hash"""
import asyncio
from sqlalchemy import select, func
from src.core.database import get_db
from src.modules.users.model import Usuario

async def check_admin():
    async for db in get_db():
        result = await db.execute(
            select(
                Usuario.id_usuario,
                Usuario.nombre_usuario,
                func.length(Usuario.contrasena_hash).label('hash_length'),
                Usuario.contrasena_hash
            ).where(Usuario.nombre_usuario == 'admin')
        )
        user = result.first()
        if user:
            print(f"ID: {user.id_usuario}")
            print(f"Usuario: {user.nombre_usuario}")
            print(f"Longitud del hash: {user.hash_length}")
            print(f"Hash: {user.contrasena_hash[:50]}...")
        else:
            print("Usuario admin no encontrado")
        break

if __name__ == "__main__":
    asyncio.run(check_admin())
