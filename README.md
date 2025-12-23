# Sistema de Gestión de Pedidos

Aplicación web para gestión de pedidos con trazabilidad completa.

## Stack
- Python 3.12+
- FastAPI
- PostgreSQL
- SQLAlchemy
- JWT Authentication

## Estructura del Proyecto
```
src/
├── main.py              # Aplicación principal
├── config/
│   └── settings.py      # Configuración
├── core/
│   ├── database.py      # Conexión BD
│   ├── security.py      # Auth/Security
│   └── deps.py          # Dependencias
└── modules/
    ├── auth/            # Autenticación
    ├── users/           # Usuarios
    ├── clients/         # Clientes
    ├── products/        # Productos
    ├── orders/          # Pedidos
    └── payments/        # Pagos
```

## Instalación

1. Clonar el repositorio
2. Crear entorno virtual:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

3. Instalar dependencias:
```bash
pip install -r requirements.txt
```

4. **🔒 CONFIGURAR CREDENCIALES DE FORMA SEGURA:**
```bash
# Copiar el archivo de ejemplo
copy .env.example .env

# Editar .env con tus credenciales REALES
# NUNCA subas el archivo .env a Git
```

**Generar SECRET_KEY seguro:**
```bash
# Opción 1: OpenSSL
openssl rand -hex 32

# Opción 2: Python
python -c "import secrets; print(secrets.token_hex(32))"
```

5. **Configurar `.env`:**
```bash
# .env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=proyecto_gestion_pedidos
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD_REAL_AQUI  # ⚠️ CAMBIAR ESTO
SECRET_KEY=TU_SECRET_KEY_GENERADO   # ⚠️ CAMBIAR ESTO
DEBUG=True
```

6. La base de datos debe existir previamente en PostgreSQL

7. **⚠️ VERIFICAR SEGURIDAD:**
```bash
# Asegurarse que .env NO está en Git
git status
# .env NO debe aparecer en "Changes to be committed"
```

## Ejecución

```bash
uvicorn src.main:app --reload
```

La aplicación estará disponible en: http://localhost:8000

## Documentación API

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Roles de Usuario

- **admin**: Acceso total, gestión de usuarios
- **supervisor**: Pedidos, pagos e inventario
- **vendedor**: Solo pedidos y pagos

## Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Login (público)

### Productos
- `GET /api/products/catalog` - Catálogo público
- `GET /api/products/` - Listar productos (auth)
- `POST /api/products/` - Crear producto (admin/supervisor)

### Clientes
- `GET /api/clients/` - Listar clientes
- `POST /api/clients/` - Crear cliente

### Pedidos
- `GET /api/orders/` - Listar pedidos
- `POST /api/orders/` - Crear pedido (reduce stock automáticamente)

### Pagos
- `POST /api/payments/` - Registrar pago (actualiza estado del pedido)
- `GET /api/payments/order/{order_id}/summary` - Resumen de pagos

## Flujo de Trabajo

1. **Vendedor** crea un pedido
2. Pedido inicia como "pendiente"
3. Stock se reduce automáticamente
4. **Vendedor** registra pagos acumulativos
5. Cuando `total_pagado >= total`, estado cambia a "pagado"

## Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Autenticación JWT con tokens de 30 minutos
- ✅ Control de acceso por roles (RBAC)
- ✅ Validación de permisos en cada endpoint
- ✅ **Credenciales en archivo `.env` (NUNCA en código fuente)**
- ✅ `.env` en `.gitignore` (protección contra commits accidentales)
- ✅ Validación de SECRET_KEY al iniciar
- ✅ Variables de entorno con valores seguros

**📖 Lee `SEGURIDAD.md` para guía completa de seguridad.**

### 📚 Documentación Adicional

- **📖 `SEGURIDAD.md`** - Guía completa de seguridad y buenas prácticas
- **📝 `EJEMPLOS_API.md`** - Ejemplos de uso con curl y flujos completos
- **🚀 `COMANDOS.md`** - Comandos útiles y solución de problemas
- **📊 `MEJORAS_SEGURIDAD.md`** - Resumen de mejoras de seguridad implementadas

### 🔧 Scripts Útiles

```bash
# Verificar seguridad antes de ejecutar
python check_security.py

# Inspeccionar estructura de base de datos
python inspect_db.py

# Crear usuario administrador
python create_admin.py
```

### ⚠️ Antes de Producción:
1. Cambiar `SECRET_KEY` por uno nuevo y único
2. Cambiar todas las contraseñas por defecto
3. Configurar `DEBUG=False`
4. Usar HTTPS
5. Configurar CORS adecuadamente
6. Usar variables de entorno del sistema (no archivo .env)
