# Ejemplos de Uso de la API

## 🚀 Servidor ejecutándose en: http://localhost:8000

## 📚 Documentación interactiva
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 1️⃣ AUTENTICACIÓN

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Respuesta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user_id": 1,
  "username": "admin",
  "rol": "admin"
}
```

**⚠️ Guarda el `access_token` para usarlo en las siguientes peticiones**

---

## 2️⃣ PRODUCTOS (Catálogo Público)

### Ver catálogo público (sin autenticación)
```bash
curl http://localhost:8000/api/products/catalog
```

---

## 3️⃣ PRODUCTOS (Autenticado)

### Listar todos los productos
```bash
curl http://localhost:8000/api/products/ \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### Crear producto (Admin/Supervisor)
```bash
curl -X POST http://localhost:8000/api/products/ \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Camisa Polo Azul",
    "descripcion": "Camisa polo 100% algodón",
    "precio_venta": 25.50,
    "stock": 50,
    "stock_minimo": 10
  }'
```

### Ver productos con stock bajo
```bash
curl http://localhost:8000/api/products/low-stock \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

---

## 4️⃣ CLIENTES

### Crear cliente
```bash
curl -X POST http://localhost:8000/api/clients/ \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "calle": "Calle 23 #456",
    "municipio": "Plaza",
    "provincia": "La Habana",
    "localidad": "Vedado",
    "es_mipyme": false,
    "cuenta_de_pago": "1234567890",
    "contactos": [
      {"tipo": "telefono", "valor": "+5351234567"},
      {"tipo": "email", "valor": "juan@example.com"}
    ]
  }'
```

### Listar clientes
```bash
curl http://localhost:8000/api/clients/ \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

---

## 5️⃣ PEDIDOS

### Crear pedido (reduce stock automáticamente)
```bash
curl -X POST http://localhost:8000/api/orders/ \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": 1,
    "detalles": [
      {
        "producto_id": 1,
        "cantidad": 2
      },
      {
        "producto_id": 2,
        "cantidad": 1
      }
    ]
  }'
```

**Respuesta:**
```json
{
  "id": 1,
  "cliente_id": 1,
  "fecha_pedido": "2025-12-23T10:30:00",
  "estado": "pendiente",
  "total": 76.50,
  "total_pagado": 0,
  "detalles": [...]
}
```

### Listar pedidos
```bash
curl http://localhost:8000/api/orders/ \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### Ver detalle de un pedido
```bash
curl http://localhost:8000/api/orders/1 \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

---

## 6️⃣ PAGOS

### Registrar pago (acumulativo)
```bash
curl -X POST http://localhost:8000/api/payments/ \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "pedido_id": 1,
    "monto": 30.00,
    "cuenta_origen": "1234567890"
  }'
```

### Registrar segundo pago
```bash
curl -X POST http://localhost:8000/api/payments/ \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "pedido_id": 1,
    "monto": 46.50,
    "cuenta_origen": "1234567890"
  }'
```

**✅ Cuando total_pagado >= total, el pedido cambia a "pagado"**

### Ver resumen de pagos de un pedido
```bash
curl http://localhost:8000/api/payments/order/1/summary \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**Respuesta:**
```json
{
  "order_id": 1,
  "total": 76.50,
  "total_pagado": 76.50,
  "saldo_pendiente": 0.00,
  "estado": "pagado",
  "cantidad_pagos": 2,
  "pagos": [...]
}
```

---

## 7️⃣ USUARIOS (Solo Admin)

### Crear usuario vendedor
```bash
curl -X POST http://localhost:8000/api/users/ \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "vendedor1",
    "email": "vendedor1@example.com",
    "password": "pass123",
    "rol": "vendedor"
  }'
```

### Crear usuario supervisor
```bash
curl -X POST http://localhost:8000/api/users/ \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "supervisor1",
    "email": "supervisor1@example.com",
    "password": "pass123",
    "rol": "supervisor"
  }'
```

### Listar usuarios
```bash
curl http://localhost:8000/api/users/ \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### Ver información del usuario actual
```bash
curl http://localhost:8000/api/users/me \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

---

## 🎯 FLUJO COMPLETO DE TRABAJO

1. **Login** → Obtener token
2. **Crear cliente** (si no existe)
3. **Crear productos** (si no existen)
4. **Crear pedido** → Stock se reduce automáticamente, estado = "pendiente"
5. **Registrar pagos** → Acumulativos
6. **Cuando total_pagado >= total** → Estado cambia a "pagado"

---

## 🔐 ROLES Y PERMISOS

| Endpoint | Admin | Supervisor | Vendedor |
|----------|-------|------------|----------|
| Gestión de usuarios | ✅ | ❌ | ❌ |
| Crear/editar productos | ✅ | ✅ | ❌ |
| Ver productos | ✅ | ✅ | ✅ |
| Crear clientes | ✅ | ✅ | ✅ |
| Crear pedidos | ✅ | ✅ | ✅ |
| Registrar pagos | ✅ | ✅ | ✅ |
| Ver inventario bajo | ✅ | ✅ | ❌ |

---

## 📊 ESTADOS DEL SISTEMA

### Estados de Pedido
- `pendiente`: Pedido creado, esperando pago completo
- `pagado`: Total de pagos >= total del pedido

### Validaciones Automáticas
- ✅ Stock suficiente al crear pedido
- ✅ Pago no excede saldo pendiente
- ✅ Actualización automática de estado de pedido
- ✅ Reducción automática de stock al crear pedido

---

## 🛠️ COMANDOS ÚTILES

### Detener el servidor
```bash
# Presiona CTRL+C en la terminal donde corre el servidor
```

### Reiniciar el servidor
```bash
uvicorn src.main:app --reload
```

### Ver logs en tiempo real
El servidor en modo `--reload` muestra logs automáticamente

---

## ✅ PROYECTO COMPLETADO

✅ Inspección de base de datos existente  
✅ Modelos SQLAlchemy basados en tablas reales  
✅ Schemas Pydantic con validación  
✅ Servicios con lógica de negocio  
✅ Endpoints FastAPI con control de acceso  
✅ Autenticación JWT  
✅ Control de roles (admin/supervisor/vendedor)  
✅ Gestión de productos e inventario  
✅ Gestión de clientes con contactos  
✅ Sistema de pedidos con trazabilidad  
✅ Pagos acumulativos con actualización automática  
✅ Documentación Swagger/ReDoc  
✅ Estructura modular pequeña y limpia
