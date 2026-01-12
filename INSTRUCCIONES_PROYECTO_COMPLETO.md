# INSTRUCCIONES COMPLETAS DEL PROYECTO
## Sistema de Gestión de Pedidos - MIPYME

**Propósito:** Archivo maestro con toda la información del proyecto real para consulta durante la redacción del informe técnico.

---

## 1. INFORMACIÓN GENERAL

### Nombre del Proyecto
Sistema de Gestión de Pedidos para MIPYME Comercializadora de Ácido Acético y Botellas Plásticas

### Autores
- Douglas Reyes García
- Alex Daniel Jorro Gacita

### Tutor
Lisset Salazar Gómez

### Fecha
Noviembre 2025

### Universidad
Universidad de las Ciencias Informáticas (UCI)  
Facultad de Tecnologías Interactivas  
Trabajo de Curso de Ingeniería de Software I

---

## 2. CONTEXTO DEL NEGOCIO

### Problemática Actual
La MIPYME opera con procesos manuales:
- Registro de pedidos en hojas de cálculo
- Comunicación informal entre clientes, vendedores y administrativos
- Demoras en procesamiento de pedidos
- Errores en consolidación de información
- Dificultades en control de inventario
- Poca transparencia en seguimiento de ventas
- Falta de trazabilidad en devoluciones y pagos

### Objetivo General
Diseñar e implementar un sistema web de gestión de pedidos que automatice los procesos de solicitud, validación, registro y seguimiento de pedidos, garantizando coherencia de información y mejora del desempeño organizacional.

### Alcance
- Gestión de usuarios internos (admin, supervisor, vendedor)
- Gestión de clientes y contactos
- Gestión de productos e inventario
- Gestión de pedidos con múltiples productos
- Gestión de pagos acumulativos
- Gestión de devoluciones
- Generación de reportes
- Auditoría de acciones

---

## 3. STACK TECNOLÓGICO IMPLEMENTADO

### Backend
- **Framework:** FastAPI (Python 3.12)
- **ORM:** SQLAlchemy 2.0
- **Base de Datos:** PostgreSQL 16
- **Autenticación:** JWT (jose)
- **Hashing:** bcrypt
- **Validación:** Pydantic V2

### Frontend (Mencionado)
- HTML5, CSS3, JavaScript ES2023
- Vite (para desarrollo)
- TailwindCSS (estilos)

### Infraestructura
- Docker Compose (app + BD)
- Git (control de versiones)
- GitHub (repositorio)

### Herramientas de Desarrollo
- **IDE:** Visual Studio Code
- **CASE:** Lucidchart, Visual Paradigm 8.0
- **Testing:** PyTest, pytest-cov
- **DB Admin:** pgAdmin 4

---

## 4. METODOLOGÍA DE DESARROLLO

### Metodología: Extreme Programming (XP)

#### Justificación (Modelo Estrella Boehm-Turner)
- **Criticidad:** Baja (sin riesgo significativo)
- **Dinamismo:** Medio (cambios moderados)
- **Cultura:** Baja (equipo con poca colaboración consolidada)
- **Tamaño:** Pequeño (2 personas)
- **Personal:** Dos desarrolladores junior

#### Enfoque
- Modelo incremental
- Iteraciones cortas (1-2 semanas)
- Desarrollo guiado por historias de usuario
- Entrega temprana de valor
- Retroalimentación continua del cliente

#### Prácticas XP Aplicadas
- Planificación basada en historias de usuario
- Desarrollo iterativo con ciclos cortos
- Programación en parejas
- Integración continua
- Refactorización constante
- Pruebas automatizadas (TDD)
- Revisiones técnicas continuas

---

## 5. ARQUITECTURA DEL SISTEMA

### Patrón Arquitectónico
**Arquitectura en capas (Layered Architecture)**

```
┌─────────────────────────────────────┐
│     CAPA DE PRESENTACIÓN           │  (API REST - FastAPI)
├─────────────────────────────────────┤
│     CAPA DE SERVICIOS              │  (Lógica de negocio)
├─────────────────────────────────────┤
│     CAPA DE REPOSITORIO/MODELO     │  (SQLAlchemy ORM)
├─────────────────────────────────────┤
│     CAPA DE DATOS                  │  (PostgreSQL)
└─────────────────────────────────────┘
```

### Estructura de Carpetas (Backend)
```
src/
├── main.py                 # Aplicación principal FastAPI
├── config/
│   └── settings.py         # Configuración (variables de entorno)
├── core/
│   ├── database.py         # Conexión a BD (SQLAlchemy engine)
│   ├── security.py         # Autenticación JWT, hashing bcrypt
│   └── deps.py             # Dependencias (get_db, get_current_user)
│   └── audit_middleware.py # Middleware para logs de auditoría
└── modules/
    ├── auth/
    │   ├── model.py        # (No aplica, usa Usuario)
    │   ├── schema.py       # LoginRequest, TokenResponse
    │   ├── service.py      # AuthService.authenticate_user()
    │   └── routes.py       # POST /api/auth/login
    ├── users/
    │   ├── model.py        # Usuario (username, email, rol, hashed_password)
    │   ├── schema.py       # UserCreate, UserResponse
    │   ├── service.py      # UserService (CRUD, validaciones)
    │   └── routes.py       # /api/users/
    ├── clients/
    │   ├── model.py        # Cliente, ContactoCliente
    │   ├── schema.py       # ClienteCreate, ClienteResponse
    │   ├── service.py      # ClientService
    │   └── routes.py       # /api/clients/
    ├── products/
    │   ├── model.py        # Producto (nombre, precio_venta, stock)
    │   ├── schema.py       # ProductoCreate, ProductoResponse
    │   ├── service.py      # ProductService
    │   └── routes.py       # /api/products/, /api/products/catalog
    ├── orders/
    │   ├── model.py        # Pedido, DetallePedido
    │   ├── schema.py       # PedidoCreate, PedidoResponse
    │   ├── service.py      # OrderService.create_order() con transacciones
    │   └── routes.py       # /api/orders/
    ├── payments/
    │   ├── model.py        # Pago
    │   ├── schema.py       # PagoCreate, PagoResponse
    │   ├── service.py      # PaymentService con calcular_monto_pendiente()
    │   └── routes.py       # /api/payments/
    ├── audit/
    │   ├── model.py        # AuditLog (logs_acciones)
    │   ├── schema.py       # AuditLogResponse
    │   ├── service.py      # AuditService
    │   └── routes.py       # /api/audit/
    └── devoluciones/
        ├── model.py        # Devolucion
        ├── schema.py       # DevolucionCreate
        ├── service.py      # DevolucionService.crear_devolucion()
        └── routes.py       # /api/devoluciones/
```

---

## 6. MODELO DE DATOS (Base de Datos Real)

### Conexión a BD
```
Host: localhost
Puerto: 5432
Base de datos: proyecto_gestion_pedidos
Usuario: postgres
```

### Tablas Principales

#### 1. usuarios
```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    rol VARCHAR(11) NOT NULL,  -- admin, supervisor, vendedor
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. clientes
```sql
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    direccion TEXT,
    es_mipyme BOOLEAN DEFAULT FALSE,
    cuenta_de_pago VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. contactos_clientes
```sql
CREATE TABLE contactos_clientes (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL,  -- telefono, email, whatsapp
    valor VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. productos
```sql
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio_venta NUMERIC(12,2) NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 0,  -- stock
    stock_minimo INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. pedidos
```sql
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id),
    usuario_id INTEGER REFERENCES usuarios(id),
    estado VARCHAR(20) DEFAULT 'pendiente',  -- pendiente, pagado, cancelado, devuelto
    total NUMERIC(12,2) NOT NULL,
    total_pagado NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. detalles_pedido
```sql
CREATE TABLE detalles_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario NUMERIC(12,2) NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 7. pagos
```sql
CREATE TABLE pagos (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id),
    monto NUMERIC(12,2) NOT NULL,
    metodo_pago VARCHAR(50),  -- efectivo, transferencia, tarjeta
    referencia VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 8. devoluciones
```sql
CREATE TABLE devoluciones (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER UNIQUE NOT NULL REFERENCES pedidos(id),
    usuario_id INTEGER REFERENCES usuarios(id),
    motivo VARCHAR(255),
    descripcion TEXT,
    fecha_devolucion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    productos_devueltos JSONB,  -- [{producto_id, cantidad, precio}]
    monto_total NUMERIC(12,2)
);
```

#### 9. logs_acciones
```sql
CREATE TABLE logs_acciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    endpoint VARCHAR(255),
    metodo_http VARCHAR(10),
    payload JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    status_code INTEGER,
    response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Función SQL Especial
```sql
CREATE OR REPLACE FUNCTION calcular_monto_pendiente(pedido_id_param INTEGER)
RETURNS NUMERIC(12,2) AS $$
DECLARE
    total_pedido NUMERIC(12,2);
    total_pagado_pedido NUMERIC(12,2);
BEGIN
    SELECT total, total_pagado 
    INTO total_pedido, total_pagado_pedido
    FROM pedidos 
    WHERE id = pedido_id_param;
    
    RETURN total_pedido - total_pagado_pedido;
END;
$$ LANGUAGE plpgsql;
```

---

## 7. REGLAS DE NEGOCIO IMPLEMENTADAS

### RN-01: Validación de Stock
Al crear un pedido, el sistema valida que haya stock suficiente antes de confirmar. Si no hay stock, rechaza el pedido con error 400.

**Implementación:**
```python
# src/modules/orders/service.py
if producto.stock < detalle.cantidad:
    raise HTTPException(400, f"Stock insuficiente para {producto.nombre}")
```

### RN-02: Reducción Automática de Stock
Al confirmar un pedido, el stock de cada producto se reduce automáticamente.

**Implementación:**
```python
producto.stock -= detalle.cantidad
```

### RN-03: Pagos Acumulativos
Un pedido puede tener múltiples pagos. El campo `total_pagado` se actualiza con cada pago.

**Implementación:**
```python
pedido.total_pagado += pago.monto
```

### RN-04: Cambio Automático a Estado "Pagado"
Cuando `total_pagado >= total`, el estado del pedido cambia automáticamente a "pagado".

**Implementación:**
```python
monto_pendiente = calcular_monto_pendiente(pedido_id)
if monto_pendiente <= 0.01:
    pedido.estado = "pagado"
```

### RN-05: Cálculo Exacto de Monto Pendiente
Se usa la función SQL `calcular_monto_pendiente()` para evitar inconsistencias por redondeo.

**Implementación:**
```python
result = db.execute(text("SELECT calcular_monto_pendiente(:order_id)"), {"order_id": order_id})
monto_pendiente = result.scalar()
```

### RN-06: Restricción de Sobrepago
El sistema rechaza pagos que excedan el monto pendiente.

**Implementación:**
```python
if pago.monto > monto_pendiente:
    raise HTTPException(400, "El monto excede el saldo pendiente")
```

### RN-07: Devolución Cambia Estado a "Devuelto"
Al registrar una devolución, el estado del pedido cambia a "devuelto".

**Implementación:**
```python
pedido.estado = "devuelto"
```

### RN-08: Restauración de Inventario en Devolución
Los productos devueltos se suman de vuelta al stock.

**Implementación:**
```python
for detalle in pedido.detalles:
    producto = db.query(Producto).filter_by(id=detalle.producto_id).first()
    producto.cantidad += detalle.cantidad
```

### RN-09: Eliminación de Pagos en Devolución
Al devolver un pedido, se eliminan todos los pagos asociados y `total_pagado` se resetea a 0.

**Implementación:**
```python
for pago in pedido.pagos:
    db.delete(pago)
pedido.total_pagado = 0
```

---

## 8. FUNCIONALIDADES PRINCIPALES

### 8.1 Autenticación (JWT)
- **Endpoint:** `POST /api/auth/login`
- **Flujo:**
  1. Usuario envía `username` y `password`
  2. Sistema valida credenciales con bcrypt
  3. Si válido, genera JWT con `sub`, `username`, `rol`
  4. Token expira en 30 minutos
- **Código clave:** `src/modules/auth/service.py`

### 8.2 Gestión de Usuarios
- **Roles:** admin, supervisor, vendedor
- **Permisos:**
  - Admin: acceso total, gestión de usuarios
  - Supervisor: pedidos, pagos, inventario
  - Vendedor: solo pedidos y pagos
- **Endpoints:** `/api/users/`, `/api/users/me`
- **Código clave:** `src/modules/users/service.py`

### 8.3 Gestión de Productos
- **Catálogo público:** `/api/products/catalog` (sin auth)
- **CRUD completo:** admin y supervisor
- **Alertas de stock bajo:** `/api/products/low-stock`
- **Código clave:** `src/modules/products/service.py`

### 8.4 Gestión de Pedidos
- **Creación con múltiples productos**
- **Validación automática de stock**
- **Reducción de stock al crear pedido**
- **Estados:** pendiente → pagado → devuelto
- **Endpoints:** `/api/orders/`, `/api/orders/{id}`
- **Código clave:** `src/modules/orders/service.py`

### 8.5 Gestión de Pagos
- **Pagos acumulativos**
- **Actualización automática de estado**
- **Resumen de pagos:** `/api/payments/order/{id}/summary`
- **Validación de sobrepago**
- **Código clave:** `src/modules/payments/service.py`

### 8.6 Gestión de Devoluciones
- **Registro con motivo y descripción**
- **Cambio de estado a "devuelto"**
- **Restauración de inventario**
- **Eliminación de pagos asociados**
- **Código clave:** `src/modules/devoluciones/service.py`

### 8.7 Auditoría
- **Registro automático de todas las acciones**
- **Middleware `AuditMiddleware`**
- **Captura:** usuario, endpoint, método HTTP, payload, IP, user-agent, status, tiempo de respuesta
- **Tabla:** `logs_acciones`
- **Código clave:** `src/core/audit_middleware.py`

---

## 9. SEGURIDAD IMPLEMENTADA

### 9.1 Variables de Entorno
- Credenciales en archivo `.env` (NO en código)
- `.env` en `.gitignore`
- Validación automática al iniciar

**Archivo `.env`:**
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=proyecto_gestion_pedidos
DB_USER=postgres
DB_PASSWORD=YmVzFstF
SECRET_KEY=tu_secret_key_aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=True
```

### 9.2 Hashing de Contraseñas
- **Librería:** bcrypt
- **Salt:** Automático
- **Código:**
```python
def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
```

### 9.3 Autenticación JWT
- **Librería:** python-jose
- **Algoritmo:** HS256
- **Expiración:** 30 minutos
- **Código:**
```python
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
```

### 9.4 Control de Acceso (RBAC)
- Decorador `@require_role(["admin"])`
- Validación en `src/core/deps.py`
- Código:
```python
def require_role(roles: List[str]):
    def decorator(func):
        async def wrapper(*args, current_user: Usuario = Depends(get_current_user), **kwargs):
            if current_user.rol not in roles:
                raise HTTPException(403, "No tiene permisos")
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator
```

### 9.5 Script de Verificación
**Archivo:** `check_security.py`
- Valida que `.env` existe
- Verifica que SECRET_KEY no es el de ejemplo
- Verifica que DB_PASSWORD no es débil
- Alerta si DEBUG=True

---

## 10. PRUEBAS IMPLEMENTADAS

### 10.1 Framework de Testing
- **Librería:** PyTest
- **Cobertura:** pytest-cov
- **Objetivo:** 89% de cobertura

### 10.2 Tipos de Pruebas
1. **Pruebas Unitarias:** Servicios individuales
2. **Pruebas de Integración:** Endpoints con BD real
3. **Pruebas de Seguridad:** Validación de auth y permisos

### 10.3 Ejemplo de Test
```python
def test_create_order_reduces_stock(client, auth_headers):
    # Arrange: Create product with stock=10
    # Act: Create order with quantity=5
    # Assert: Stock should be 5
    pass
```

---

## 11. DOCUMENTACIÓN ENTREGADA

### Archivos de Documentación
1. **README.md** - Guía principal del proyecto
2. **SEGURIDAD.md** - Guía completa de seguridad
3. **EJEMPLOS_API.md** - Ejemplos de uso con curl
4. **COMANDOS.md** - Comandos útiles y troubleshooting
5. **RESUMEN_PROYECTO.md** - Estado y checklist completo
6. **ISW_MYPIME_extracted.txt** - Documento ISW original (800+ líneas)
7. **INSTRUCCIONES_PROYECTO_COMPLETO.md** - Este archivo

### Scripts Utilitarios
1. **check_security.py** - Verificación de seguridad
2. **inspect_db.py** - Inspección de estructura de BD
3. **create_admin.py** - Creación de usuario admin
4. **create_vendedor.py** - Creación de usuario vendedor
5. **create_sample_products.py** - Datos de prueba
6. **generate_hash.py** - Generación de hash bcrypt
7. **test_api.py** - Pruebas de endpoints

---

## 12. DIAGRAMAS UML DISPONIBLES

### Ubicación
`diagramas_analisis/`

### Diagramas Generados (44 archivos .drawio)
- **RF01-RF06:** Gestión de usuarios
- **RF07-RF08:** Autenticación
- **RF09-RF13:** Gestión de clientes
- **RF14-RF18:** Gestión de productos
- **RF19-RF20:** Inventario
- **RF21-RF27:** Gestión de pedidos
- **RF28-RF33:** Gestión de pagos
- **RF34-RF38:** Reportes y estadísticas
- **RF39-RF40:** Auditoría
- **RF41-RF44:** Devoluciones

### Diagrama ER
**Archivo:** `diagramas_analisis/er_modelo_base.mmd`
- 9 entidades
- Relaciones con cardinalidades
- Atributos con tipos de datos
- PKs y FKs marcadas

---

## 13. COMANDOS IMPORTANTES

### Iniciar Proyecto
```bash
# Activar entorno virtual
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Verificar seguridad
python check_security.py

# Iniciar servidor
uvicorn src.main:app --reload
```

### Base de Datos
```bash
# Inspeccionar estructura
python inspect_db.py

# Crear usuario admin
python create_admin.py

# Crear datos de prueba
python create_sample_products.py
```

### Testing
```bash
# Ejecutar todos los tests
pytest

# Con cobertura
pytest --cov=src --cov-report=html

# Test específico
pytest tests/test_orders.py -v
```

---

## 14. ENDPOINTS COMPLETOS

### Autenticación
```
POST /api/auth/login
Body: {"username": "admin", "password": "admin123"}
Response: {"access_token": "...", "token_type": "bearer"}
```

### Usuarios
```
GET /api/users/me
Headers: Authorization: Bearer <token>

GET /api/users/
POST /api/users/
Body: {"username": "...", "email": "...", "password": "...", "rol": "vendedor"}
```

### Productos
```
GET /api/products/catalog  (público)
GET /api/products/
POST /api/products/
Body: {"nombre": "...", "precio_venta": 100, "cantidad": 50}

GET /api/products/low-stock?umbral=10
```

### Clientes
```
GET /api/clients/
POST /api/clients/
Body: {"nombre": "...", "direccion": "...", "contactos": [...]}
```

### Pedidos
```
GET /api/orders/
POST /api/orders/
Body: {
  "cliente_id": 1,
  "detalles": [{"producto_id": 1, "cantidad": 5}],
  "pago_inmediato": {"monto": 500, "metodo_pago": "transferencia"}
}

GET /api/orders/{id}
```

### Pagos
```
POST /api/payments/
Body: {"pedido_id": 1, "monto": 250, "metodo_pago": "efectivo"}

GET /api/payments/order/{id}/summary
```

### Devoluciones
```
POST /api/devoluciones/
Body: {"pedido_id": 1, "motivo": "Producto dañado"}
```

### Auditoría
```
GET /api/audit/logs
GET /api/audit/logs/user/{user_id}
```

---

## 15. REQUISITOS FUNCIONALES (44 RF)

### RF01-RF07: Gestión de Usuarios y Autenticación
- RF01: Crear cuenta de cliente
- RF02: Modificar datos de cliente
- RF03: Eliminar cliente
- RF04: Consultar clientes
- RF05: Iniciar sesión (autenticación)
- RF06: Cerrar sesión
- RF07: Recuperar contraseña

### RF08-RF11: Gestión de Roles
- RF08: Crear rol
- RF09: Modificar rol
- RF10: Eliminar rol
- RF11: Consultar roles

### RF12-RF19: Gestión de Productos
- RF12: Crear producto
- RF13: Modificar producto
- RF14: Eliminar producto
- RF15: Consultar productos
- RF16: Crear categoría/presentación
- RF17: Modificar categoría
- RF18: Eliminar categoría
- RF19: Consultar categorías

### RF20-RF28: Gestión de Pedidos y Pagos
- RF20: Crear pedido
- RF21: Validar disponibilidad/reservar stock
- RF22: Confirmar pedido provisional
- RF23: Modificar estado de pedido
- RF24: Registrar pago
- RF25: Pagar fraccionados/abonos
- RF26: Verificar automáticamente pagos
- RF27: Generar recibo/comprobante de venta
- RF28: Emitir nota de crédito/reembolso

### RF29-RF33: Inventario y Devoluciones
- RF29: Iniciar devolución
- RF30: Actualizar inventario por venta
- RF31: Actualizar inventario por devolución
- RF32: Ajustar manualmente el inventario
- RF33: Emitir alertas de stock mínimo

### RF34-RF41: Reportes, Auditoría y Administración
- RF34: Mantener histórico de pedidos y transacciones
- RF35: Generar reportes operativos básicos
- RF36: Exportar/importar datos (CSV/Excel)
- RF37: Auditar actividades
- RF38: Notificar automáticamente
- RF39: Emitir panel administrativo/dashboard
- RF40: Emitir facturas legales
- RF41: Mantener y configurar el sistema

---

## 16. REQUISITOS NO FUNCIONALES

### RNF-01 a RNF-04: Rendimiento
- RNF-01: Carga de páginas < 3 segundos
- RNF-02: Actualización de inventario < 2 segundos
- RNF-03: Soporte para 500 usuarios simultáneos
- RNF-04: Reportes generados < 10 segundos

### RNF-05 a RNF-10: Seguridad
- RNF-05: Contraseñas cifradas (bcrypt)
- RNF-06: Comunicación HTTPS
- RNF-07: Solo usuarios autenticados
- RNF-08: Registro de logs de auditoría
- RNF-09: Roles validados en backend
- RNF-10: Recuperación de contraseña por correo

### RNF-11 a RNF-15: Usabilidad
- RNF-11: Interfaz intuitiva para no técnicos
- RNF-12: Responsive (móvil, tablet, PC)
- RNF-13: Botones etiquetados claramente
- RNF-14: Confirmaciones visuales (alertas, toasts)
- RNF-15: Panel de admin con menús laterales

### RNF-16 a RNF-19: Compatibilidad
- RNF-16: Funciona en Android, iOS y web
- RNF-17: BD SQL (PostgreSQL)
- RNF-18: Integración con notificaciones (Firebase, OneSignal)
- RNF-19: Exportación en PDF, XLSX, CSV

### RNF-20 a RNF-23: Mantenibilidad
- RNF-20: Código documentado y versionado (GitHub)
- RNF-21: Arquitectura modular (MVC)
- RNF-22: Agregar roles/módulos sin reestructurar
- RNF-23: Actualizaciones sin pérdida de datos

### RNF-24 a RNF-27: Fiabilidad
- RNF-24: Disponibilidad 99% mensual
- RNF-25: Respaldo automático diario
- RNF-26: Recuperación < 10 minutos ante fallas
- RNF-27: Sin pérdida de datos ante desconexiones

### RNF-28 a RNF-30: Escalabilidad
- RNF-28: Ampliable para más productos, usuarios, tiendas
- RNF-29: Conexión con apps móviles o módulos externos
- RNF-30: Arquitectura sin reestructuración completa

### RNF-31 a RNF-33: Legalidad y Privacidad
- RNF-31: Cumplimiento GDPR o equivalente
- RNF-32: Datos de clientes no compartidos sin consentimiento
- RNF-33: Eliminación de cuentas y datos a solicitud

---

## 17. HISTORIAS DE USUARIO (11 HU)

### HU-01: Registro y Acceso de Clientes
**Prioridad:** Alta | **Tiempo:** 16h  
**RF:** RF1, RF5, RF6, RF7

### HU-02: Gestión de Roles y Usuarios Internos
**Prioridad:** Alta | **Tiempo:** 16h  
**RF:** RF8, RF9, RF10, RF11

### HU-03: Gestión de Productos
**Prioridad:** Alta | **Tiempo:** 32h  
**RF:** RF12-RF19

### HU-04: Creación y Procesamiento de Pedidos
**Prioridad:** Alta | **Tiempo:** 16h  
**RF:** RF20, RF21, RF22, RF23

### HU-05: Gestión de Pagos y Comprobantes
**Prioridad:** Alta | **Tiempo:** 24h  
**RF:** RF24, RF25, RF26, RF27, RF28, RF40

### HU-06: Procesamiento de Devoluciones
**Prioridad:** Alta | **Tiempo:** 8h  
**RF:** RF29, RF31

### HU-07: Actualización y Control de Inventario
**Prioridad:** Alta | **Tiempo:** 8h  
**RF:** RF30, RF32, RF33

### HU-08: Seguimiento Histórico y Reportes
**Prioridad:** Alta | **Tiempo:** 12h  
**RF:** RF34, RF35

### HU-09: Integración del Sistema
**Prioridad:** Media | **Tiempo:** 24h  
**RF:** RF36, RF37, RF38, RF39, RF41

### HU-10: Listar Clientes
**Prioridad:** Alta | **Tiempo:** 16h  
**RF:** RF4

### HU-11: Administrar Cuenta Cliente
**Prioridad:** Alta | **Tiempo:** 16h  
**RF:** RF2, RF3

---

## 18. CASOS DE PRUEBA (44 CP)

Ver ISW_MYPIME_extracted.txt líneas 700-1800 para la especificación completa de los 44 casos de prueba, cada uno con:
- Entrada
- Acción
- Resultado esperado
- Casos positivos y negativos

---

## 19. CONCEPTOS CLAVE DEL DOMINIO

### 1. MIPYME
Micro, pequeña o mediana empresa. En Cuba, sector empresarial privado autorizado.

### 2. Gestión Comercial
Conjunto de procesos administrativos, operativos y estratégicos orientados a ventas, distribución y atención al cliente.

### 3. Automatización de Procesos
Ejecución de tareas rutinarias sin intervención manual, garantizando rapidez, precisión y trazabilidad.

### 4. CRM (Customer Relationship Management)
Modelo apoyado en tecnologías para organizar, analizar y mejorar interacciones con clientes.

### 5. Trazabilidad
Capacidad de seguir el historial completo de una transacción desde su inicio hasta su conclusión.

### 6. ACID (Atomicidad, Consistencia, Aislamiento, Durabilidad)
Propiedades de transacciones en bases de datos relacionales que garantizan integridad.

### 7. RBAC (Role-Based Access Control)
Control de acceso basado en roles asignados a usuarios.

---

## 20. FUENTES DE REQUISITOS

### Stakeholders
- Dueño de la MIPYME
- Personal administrativo
- Vendedores
- Clientes frecuentes

### Técnicas de Recopilación
1. **Lluvia de ideas** - Identificación de problemas
2. **Entrevistas semiestructuradas** - Flujo de trabajo
3. **Observación directa** - Procesos manuales
4. **Análisis documental** - Registros de pedidos

### Metas del Negocio
- Reducir tiempo de atención
- Optimizar gestión de inventario
- Incrementar eficiencia de pagos
- Mejorar trazabilidad

---

## 21. ESTADO ACTUAL DEL PROYECTO

### ✅ COMPLETADO
- [x] Base de datos diseñada e implementada
- [x] Modelos SQLAlchemy de 9 tablas
- [x] Schemas Pydantic con validación
- [x] Servicios con lógica de negocio completa
- [x] Endpoints con autenticación y autorización
- [x] Sistema de roles (admin, supervisor, vendedor)
- [x] Gestión de usuarios, clientes, productos
- [x] Gestión de pedidos con validación de stock
- [x] Gestión de pagos acumulativos
- [x] Gestión de devoluciones con restauración de inventario
- [x] Auditoría automática de acciones
- [x] Middleware de logs
- [x] Seguridad de credenciales (variables de entorno)
- [x] Scripts de verificación y utilidades
- [x] Documentación técnica completa
- [x] Servidor en ejecución

### 🚀 SERVIDOR FUNCIONANDO
**URL:** http://localhost:8000  
**Docs:** http://localhost:8000/docs  
**Usuario admin:** admin / admin123

---

## 22. NOTAS PARA LA REDACCIÓN DEL INFORME

### Estructura del Informe (Guía UCI)
1. **Portada** - Título, autores, tutor, fecha
2. **Resumen** (español) - 200-300 palabras
3. **Abstract** (inglés) - Traducción del resumen
4. **Índice General**
5. **Índice de Tablas**
6. **Índice de Figuras**
7. **Opinión del Tutor** (página aparte)
8. **Introducción** - Contexto, problema, objetivos, tareas, metodología
9. **Capítulo I: Fundamentación Teórica** - Conceptos, estado del arte, análisis de mercado, metodología
10. **Capítulo II: Modelado del Contexto** - Modelo de negocio, técnicas de recopilación, reglas del negocio
11. **Capítulo III: Documentación de Requisitos** - RF, RNF, Historias de Usuario
12. **Capítulo IV: Validación y Gestión de Requisitos** - Casos de prueba, matrices de trazabilidad
13. **Capítulo V: Modelado de Estructura y Comportamiento** - Diagramas de clases, diagramas de interacción
14. **Capítulo VI: Diseño del Sistema** - Arquitectura, patrones, diagramas de componentes
15. **Capítulo VII: Implementación** - Código fuente, tecnologías, configuración
16. **Capítulo VIII: Validación** - Resultados de pruebas, cobertura, evidencias
17. **Conclusiones Generales**
18. **Recomendaciones**
19. **Referencias Bibliográficas** (APA 7ma)
20. **Anexos** (opcional)

### Secciones Ya Redactadas (ISW_MYPIME)
- ✅ Resumen completo
- ✅ Introducción completa
- ✅ Capítulo I completo (Fundamentación Teórica)
- ✅ Capítulo II completo (Modelado del Contexto)
- ✅ Capítulo III completo (Documentación de Requisitos)
- ✅ Capítulo IV completo (Validación de Requisitos)
- ✅ Conclusiones Generales
- ✅ Recomendaciones
- ✅ Referencias (4 fuentes APA)

### Pendiente de Redactar
- [ ] Capítulo V: Modelado de Estructura y Comportamiento (incluir diagrama ER)
- [ ] Capítulo VI: Diseño del Sistema (arquitectura en capas)
- [ ] Capítulo VII: Implementación (código fuente FastAPI + PostgreSQL)
- [ ] Capítulo VIII: Validación (pytest, cobertura 89%, casos de prueba ejecutados)

---

## 23. REFERENCIAS BIBLIOGRÁFICAS (APA 7ma Edición)

### Citadas en ISW_MYPIME
1. González Pérez, G. (2022). Automatización y dinámica del mercado laboral en la industria automotriz en México. *Economía Teoría y Práctica*, (56), 67-96.

2. Guerola-Navarro, V., Oltra-Badenes, R., & Gil-Gomez, H. (2020). Análisis de la relación entre el grado de introducción de CRM y los beneficios de la empresa a través del Desempeño Organizacional y la Innovación Empresarial. *3C Empresa. Investigación y Pensamiento Crítico*, 9(1), 67-87. https://doi.org/10.17993/3cemp.2020.090141.67-87

3. Ramírez Vivanco, A. E., Procel Romero, L. P., & Solórzano Solórzano, S. S. (2021). Estrategias de Internacionalización para la oferta exportable de las MIPYMES en El Oro, Ecuador. *Pro Sciences*, 5(41), 1603-1625.

4. Sommerville, I. (2011). *Ingeniería de software* (9a ed.). Pearson Educación.

### Referencias Técnicas (Agregar)
5. FastAPI. (s.f.). *FastAPI framework, high performance, easy to learn, fast to code, ready for production*. https://fastapi.tiangolo.com/

6. SQLAlchemy. (s.f.). *The Python SQL Toolkit and Object Relational Mapper*. https://www.sqlalchemy.org/

7. PostgreSQL Global Development Group. (s.f.). *PostgreSQL: The World's Most Advanced Open Source Relational Database*. https://www.postgresql.org/

8. Beck, K., & Andres, C. (2004). *Extreme Programming Explained: Embrace Change* (2nd ed.). Addison-Wesley Professional.

---

## 24. ESTRUCTURA DEL DESARROLLO (CAPÍTULOS I-VIII)

### Título del Capítulo: DESARROLLO

### Introducción (integrada al inicio, sin título de sección)
El presente capítulo desarrolla el proceso de diseño e implementación del sistema web de gestión de pedidos para la MIPYME comercializadora de ácido acético y botellas plásticas. Se estructura en ocho epígrafes que abarcan desde la fundamentación teórica hasta la validación del sistema implementado. Cada epígrafe contribuye a demostrar la pertinencia de la solución propuesta, la adecuada selección tecnológica y metodológica, y el cumplimiento de los objetivos planteados.

---

### EPÍGRAFE I: Gestión de pedidos y automatización de procesos comerciales en MIPYMES

**Objetivo:** Sistematizar los fundamentos teórico-metodológicos asociados a la gestión comercial en MIPYMES, estableciendo los referentes teóricos de la investigación.

**Contenido:**
- 1.1 Conceptos asociados al tema
  - 1.1.1 Gestión comercial en las MIPYMES
  - 1.1.2 Automatización de procesos empresariales
  - 1.1.3 Gestión de relaciones con el cliente (CRM)
  - 1.1.4 Integración de gestión comercial, automatización y CRM

**Fuentes:** ISW_MYPIME líneas 1-400 (Capítulo I, sección 1.1), Referencias: Ramírez (2021), González & Pérez (2022), López (2020)

**Páginas estimadas:** 4-5

---

### EPÍGRAFE II: Sistemas de información para la gestión de pedidos

**Objetivo:** Sistematizar los fundamentos teóricos sobre sistemas CRM y de gestión comercial, identificando brechas que justifican una solución personalizada.

**Contenido:**
- 2.1 Análisis de mercado de soluciones CRM
- 2.2 Tabla comparativa de plataformas (HubSpot, Zoho, Bitrix24, Odoo, Freshsales, Zoom LC Odoo)
- 2.3 Identificación de brechas en soluciones existentes
- 2.4 Justificación de solución personalizada para MIPYMES locales

**Fuentes:** ISW_MYPIME líneas 400-600 (sección 1.2 Análisis de mercado con tabla)

**Páginas estimadas:** 3-4

---

### EPÍGRAFE III: Diagnóstico del proceso de gestión de pedidos en la MIPYME

**Objetivo:** Describir y analizar el estado actual del objeto de estudio, demostrando la pertinencia de la investigación.

**Contenido:**
- 3.1 Técnicas de recopilación de información
  - Lluvia de ideas
  - Entrevistas semiestructuradas
  - Observación directa
  - Análisis documental
- 3.2 Fuentes de obtención de requisitos
  - Stakeholders
  - Metas del negocio
  - Conocimiento del dominio
  - Entorno operacional y organizacional
- 3.3 Modelo conceptual del negocio
- 3.4 Reglas del negocio (TABLA con 9 reglas)

**Fuentes:** ISW_MYPIME líneas 600-1000 (Capítulo II completo), INSTRUCCIONES sección 20

**Páginas estimadas:** 6-8

---

### EPÍGRAFE IV: Metodología, tecnologías y herramientas para el desarrollo del sistema

**Objetivo:** Sistematizar y justificar las tecnologías y metodología utilizadas para lograr el resultado propuesto.

**Contenido:**
- 4.1 Fundamentación del proceso de software a desarrollar
  - 4.1.1 Enfoque de ingeniería de software (Modelo Boehm y Turner)
  - 4.1.2 Modelo de proceso de software (Incremental)
  - 4.1.3 Método de ingeniería de software (Extreme Programming - XP)
- 4.2 Herramientas y tecnologías
  - 4.2.1 Herramienta CASE (Visual Paradigm 8.0, Lucidchart)
  - 4.2.2 Lenguaje de modelado (UML 2.0)
  - 4.2.3 Marco de trabajo para el desarrollo (FastAPI)
  - 4.2.4 Entorno de desarrollo integrado (Visual Studio Code)
  - 4.2.5 Lenguaje de programación (Python 3.12)
  - 4.2.6 Gestor de base de datos (PostgreSQL 16)

**Fuentes:** ISW_MYPIME líneas 1000-1400 (secciones 1.3 y 1.4), INSTRUCCIONES secciones 3 y 4

**Páginas estimadas:** 8-10

---

### EPÍGRAFE V: Arquitectura y diseño de la solución propuesta

**Objetivo:** Presentar la descripción de la solución al problema científico planteado.

**Contenido:**
- 5.1 Descripción general de la solución
- 5.2 Patrón arquitectónico (Arquitectura en capas)
  - Capa de presentación (API REST - FastAPI)
  - Capa de servicios (lógica de negocio)
  - Capa de repositorio/modelo (SQLAlchemy ORM)
  - Capa de datos (PostgreSQL)
- 5.3 Estructura modular del proyecto
- 5.4 Patrones de diseño aplicados
- 5.5 Flujo general del sistema

**Fuentes:** INSTRUCCIONES sección 5 (Arquitectura), código fuente src/

**Páginas estimadas:** 5-6

---

### EPÍGRAFE VI: Ingeniería de requisitos del sistema de gestión de pedidos

**Objetivo:** Presentar los artefactos resultantes de la ingeniería de requisitos desarrollada.

**Contenido:**
- 6.1 Requisitos funcionales (44 RF)
  - Tabla con No., Nombre, Descripción, Prioridad, Complejidad
  - Agrupados por módulos
- 6.2 Requisitos no funcionales (33 RNF)
  - Clasificación según Sommerville (2011)
  - Rendimiento, Seguridad, Usabilidad, Compatibilidad, Mantenibilidad, Fiabilidad, Escalabilidad, Legalidad
- 6.3 Historias de usuario (11 HU)
  - Formato: "Como [Rol] quiero [funcionalidad] para [objetivo]"
  - Con prioridad, tiempo estimado, criterios de aceptación
- 6.4 Agrupación de requisitos funcionales por historia de usuario
  - Tabla de trazabilidad HU ↔ RF

**Fuentes:** ISW_MYPIME líneas 1400-1600 (Capítulo III completo), INSTRUCCIONES secciones 15, 16, 17

**Páginas estimadas:** 12-15

---

### EPÍGRAFE VII: Diseño e implementación del sistema de gestión de pedidos

**Objetivo:** Presentar el diseño de los mecanismos para almacenamiento, procesamiento y transmisión de datos, así como ejemplos de implementación.

**Contenido:**
- 7.1 Diseño del modelo de datos
  - Diagrama Entidad-Relación (9 entidades)
  - Descripción de tablas con SQL
  - Relaciones y cardinalidades
  - Función SQL especial (calcular_monto_pendiente)
- 7.2 Diseño de la lógica de negocio
  - Reglas de negocio implementadas (9 reglas con código)
  - Servicios principales (descripción + fragmentos de código)
- 7.3 Implementación de la API REST
  - Endpoints principales con ejemplos curl
  - Autenticación JWT (código)
  - Control de acceso por roles (RBAC - código)
- 7.4 Implementación de seguridad
  - Hashing de contraseñas (bcrypt - código)
  - Tokens JWT con expiración (código)
  - Variables de entorno
  - Middleware de auditoría (código)
- 7.5 Interfaces gráficas de usuario
  - Capturas de Swagger UI
  - Ejemplos de respuestas JSON

**Fuentes:** INSTRUCCIONES secciones 6, 7, 8, 9, 14; código fuente src/modules/, src/core/

**Páginas estimadas:** 15-20

---

### EPÍGRAFE VIII: Verificación y validación del sistema de gestión de pedidos

**Objetivo:** Presentar el diseño de los mecanismos de verificación y validación, su ejecución y resultados obtenidos.

**Contenido:**
- 8.1 Técnicas de validación de requisitos
  - Casos de prueba (44 CP)
  - Estructura: Entrada, Acción, Resultado esperado
  - Casos positivos y negativos
- 8.2 Técnicas de gestión de requisitos
  - Matrices de trazabilidad RF ↔ Interfaces
- 8.3 Estrategia de pruebas
  - Pruebas unitarias (PyTest)
  - Pruebas de integración (endpoints + BD)
  - Pruebas de seguridad
- 8.4 Ejecución de pruebas
  - Cobertura de código (objetivo 89%)
  - Resultados de pytest (logs, reportes)
- 8.5 Resultados de la validación
  - Resumen de CP ejecutados
  - Defectos encontrados y corregidos
  - Validación con el cliente

**Fuentes:** ISW_MYPIME líneas 1600-1854 (Capítulo IV completo con 44 CP), INSTRUCCIONES sección 10

**Páginas estimadas:** 10-12

---

### RESUMEN DE ESTRUCTURA

| Epígrafe | Título | Contenido Principal | Páginas |
|----------|--------|---------------------|---------|
| Intro | (integrada) | Presentación del capítulo | 0.5 |
| I | Gestión de pedidos y automatización en MIPYMES | Conceptos teóricos | 4-5 |
| II | Sistemas de información para gestión de pedidos | Análisis de mercado + tabla | 3-4 |
| III | Diagnóstico del proceso actual | Técnicas, fuentes, modelo, reglas | 6-8 |
| IV | Metodología, tecnologías y herramientas | XP, Boehm-Turner, FastAPI, PostgreSQL | 8-10 |
| V | Arquitectura y diseño de la solución | Arquitectura en capas, estructura modular | 5-6 |
| VI | Ingeniería de requisitos | 44 RF, 33 RNF, 11 HU, trazabilidad | 12-15 |
| VII | Diseño e implementación | BD, código, API REST, seguridad, interfaces | 15-20 |
| VIII | Verificación y validación | 44 CP, pruebas, cobertura, resultados | 10-12 |
| **TOTAL** | | | **64-81 págs** |

---

## FIN DEL ARCHIVO MAESTRO DE INSTRUCCIONES
