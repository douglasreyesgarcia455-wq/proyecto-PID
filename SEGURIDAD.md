# 🔒 Guía de Seguridad

## ⚠️ IMPORTANTE: Configuración de Credenciales

### 🚨 NUNCA hacer esto:
```python
# ❌ INCORRECTO - Credenciales en código fuente
DATABASE_URL = "postgresql://postgres:mi_password@localhost:5432/db"
SECRET_KEY = "mi-clave-secreta"
```

### ✅ Configuración Correcta

#### 1️⃣ Archivo `.env` (Local/Desarrollo)

El archivo `.env` contiene las credenciales reales y **NUNCA** debe subirse a Git:

```bash
# .env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=proyecto_gestion_pedidos
DB_USER=postgres
DB_PASSWORD=tu_password_real_aqui

SECRET_KEY=09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7
```

**Generar SECRET_KEY seguro:**
```bash
# En terminal
openssl rand -hex 32
```

O en Python:
```python
import secrets
print(secrets.token_hex(32))
```

#### 2️⃣ Verificar que `.env` está en `.gitignore`

```bash
# Verificar que .env está ignorado
git status
# .env NO debe aparecer en "Changes to be committed"
```

#### 3️⃣ Variables de Entorno (Producción)

En producción, usa variables de entorno del sistema operativo:

**Linux/Mac:**
```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=proyecto_gestion_pedidos
export DB_USER=postgres
export DB_PASSWORD=tu_password_seguro
export SECRET_KEY=tu_secret_key_generado
export DEBUG=False
```

**Windows:**
```powershell
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
$env:DB_NAME="proyecto_gestion_pedidos"
$env:DB_USER="postgres"
$env:DB_PASSWORD="tu_password_seguro"
$env:SECRET_KEY="tu_secret_key_generado"
$env:DEBUG="False"
```

**Docker:**
```yaml
# docker-compose.yml
services:
  api:
    environment:
      - DB_HOST=db
      - DB_PORT=5432
      - DB_NAME=proyecto_gestion_pedidos
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - SECRET_KEY=${SECRET_KEY}
      - DEBUG=False
```

---

## 🔐 Niveles de Seguridad Implementados

### 1. **Protección de Credenciales**
- ✅ Variables de entorno en `.env`
- ✅ `.env` en `.gitignore`
- ✅ Validación de credenciales al iniciar
- ✅ Sin valores por defecto inseguros
- ✅ Advertencias si DEBUG=True

### 2. **Autenticación JWT**
- ✅ Tokens con expiración (30 minutos por defecto)
- ✅ Secret key fuerte (mínimo 32 caracteres)
- ✅ Algoritmo HS256
- ✅ Tokens en header Authorization

### 3. **Hash de Contraseñas**
- ✅ Bcrypt con salt automático
- ✅ Nunca se almacenan contraseñas en texto plano
- ✅ Hash irreversible

### 4. **Control de Acceso**
- ✅ RBAC (Role-Based Access Control)
- ✅ Validación de roles en cada endpoint
- ✅ Usuarios inactivos no pueden acceder

### 5. **Validación de Entrada**
- ✅ Pydantic schemas
- ✅ Tipos de datos estrictos
- ✅ Longitud máxima de campos
- ✅ Patrones de validación

---

## 📋 Checklist de Seguridad

### Antes de Desarrollo:
- [ ] Copiar `.env.example` a `.env`
- [ ] Configurar credenciales reales en `.env`
- [ ] Generar SECRET_KEY único
- [ ] Verificar que `.env` está en `.gitignore`

### Antes de Producción:
- [ ] Cambiar todas las contraseñas por defecto
- [ ] Generar nuevo SECRET_KEY (nunca usar el de desarrollo)
- [ ] Configurar `DEBUG=False`
- [ ] Usar HTTPS (no HTTP)
- [ ] Configurar CORS adecuadamente
- [ ] Usar variables de entorno del sistema (no archivo .env)
- [ ] Limitar IPs que pueden acceder a la base de datos
- [ ] Configurar firewall
- [ ] Habilitar SSL/TLS para PostgreSQL
- [ ] Configurar logs de auditoría
- [ ] Backup automático de base de datos cifrado

### Usuarios:
- [ ] Cambiar contraseña del usuario `admin` por defecto
- [ ] Crear usuarios con contraseñas fuertes
- [ ] Asignar roles mínimos necesarios
- [ ] Revisar usuarios inactivos periódicamente

---

## 🛡️ Buenas Prácticas Adicionales

### Contraseñas de Usuarios
- Mínimo 8 caracteres
- Incluir mayúsculas, minúsculas, números y símbolos
- No usar información personal
- Cambiar contraseñas periódicamente

### Base de Datos
```sql
-- Crear usuario específico para la app (no usar postgres)
CREATE USER pedidos_app WITH PASSWORD 'password_fuerte_aqui';
GRANT CONNECT ON DATABASE proyecto_gestion_pedidos TO pedidos_app;
GRANT USAGE ON SCHEMA public TO pedidos_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO pedidos_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO pedidos_app;
```

### Configuración de PostgreSQL (pg_hba.conf)
```conf
# Permitir solo conexiones locales
host    proyecto_gestion_pedidos    pedidos_app    127.0.0.1/32    scram-sha-256
```

### CORS en Producción
```python
# src/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://tu-dominio.com"],  # Solo tu frontend
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

---

## 🚨 Qué Hacer si las Credenciales se Exponen

1. **Inmediatamente:**
   - Cambiar todas las contraseñas
   - Rotar SECRET_KEY
   - Invalidar todos los tokens JWT
   - Revisar logs de acceso

2. **Si se subió a Git:**
   ```bash
   # Remover del historial de Git
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   
   # Forzar push
   git push origin --force --all
   ```

3. **Notificar:**
   - Informar al equipo
   - Documentar el incidente
   - Implementar controles adicionales

---

## 📞 Soporte

Para reportar problemas de seguridad, contactar al administrador del sistema.

**🔒 Recuerda: La seguridad es responsabilidad de todos.**
