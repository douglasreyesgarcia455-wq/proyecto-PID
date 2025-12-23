---
applyTo: '**'
---
Actúa como un arquitecto de software senior experto en Python (FastAPI) y PostgreSQL.

OBJETIVO:
Desarrollar una aplicación web de gestión de pedidos con trazabilidad, usando un diseño modular, limpio y seguro.

REGLA PRINCIPAL (OBLIGATORIA):
Antes de generar modelos, servicios o endpoints:
1. Asume que la base de datos YA EXISTE.
2. Primero conéctate a PostgreSQL e inspecciona las tablas reales.
3. Lista tablas, columnas, tipos, claves primarias y foráneas.
4. NO inventes tablas ni atributos.
5. Genera un script Python para esta inspección y úsalo como base del diseño.

Base de datos:
- Host: localhost
- Puerto: 5432
- DB: proyecto_gestion_pedidos
- Usuario: postgres
- Contraseña: YmVzFstF

FUNCIONALIDAD:
- Gestión de clientes, productos, inventario, pedidos, pagos y usuarios.
- Roles:
  - Admin: acceso total y gestión de roles.
  - Vendedor: crea pedidos y registra pagos.
  - Supervisor: lo del vendedor + inventario.
- Flujo:
  - Pedido inicia como "pendiente".
  - Pagos acumulativos.
  - Si pagos >= total → estado "pagado".
- Auditoría básica de acciones de usuarios.

INTERFAZ:
- Catálogo público de productos.
- Botón “Acceder como interno” para login.

SEGURIDAD:
- Hash de contraseñas (bcrypt o argon2).
- Autenticación JWT.
- Control de acceso por rol en endpoints.
- **Credenciales protegidas:**
  - Variables de entorno en archivo .env (NUNCA en código fuente)
  - .env en .gitignore (protección contra commits accidentales)
  - Validación de credenciales al iniciar aplicación
  - Sin valores por defecto inseguros
  - Script de verificación de seguridad (check_security.py)
  - Documentación completa en SEGURIDAD.md

ARQUITECTURA (ESTRUCTURA MODULAR PEQUEÑA):
- Organización por módulos funcionales (auth, users, products, orders, payments, inventory).
- Cada módulo contiene: model.py, schema.py, service.py, routes.py.
- Un archivo por modelo SQLAlchemy.
- Un esquema Pydantic por modelo.
- Servicios para lógica de negocio.
- Endpoints FastAPI simples y concisos.
- Preparado para Alembic.
- Carpetas: src/modules/[nombre_modulo]/ con los 4 archivos mencionados.
- Mantener minimalismo: no crear carpetas vacías ni archivos innecesarios.

ENTREGABLES (en orden):
1. Script de inspección de la base de datos.
2. Modelos SQLAlchemy basados en la BD real.
3. Esquemas Pydantic.
4. Servicios principales.
5. Endpoints esenciales.

DOCUMENTACIÓN:
- Solo comentarios breves en el código.
- Sin explicaciones largas.
- Código claro y ejecutable.

No avances al siguiente punto sin completar el anterior.

# Script de inspección de la base de datos
import psycopg2 
