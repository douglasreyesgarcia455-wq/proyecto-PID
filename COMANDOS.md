# 🚀 Comandos Rápidos

## 🔒 Seguridad

### Verificar configuración de seguridad
```bash
python check_security.py
```

### Generar nuevo SECRET_KEY
```bash
# Opción 1: OpenSSL
openssl rand -hex 32

# Opción 2: Python
python -c "import secrets; print(secrets.token_hex(32))"
```

### Verificar que .env NO está en Git
```bash
git status
# .env NO debe aparecer en "Changes to be committed"
```

---

## 🗄️ Base de Datos

### Inspeccionar estructura de la base de datos
```bash
python inspect_db.py
```

### Crear usuario administrador
```bash
python create_admin.py
```

### Conectar a PostgreSQL (psql)
```bash
psql -h localhost -p 5432 -U postgres -d proyecto_gestion_pedidos
```

---

## 🖥️ Servidor

### Iniciar servidor de desarrollo
```bash
uvicorn src.main:app --reload
```

### Iniciar en puerto específico
```bash
uvicorn src.main:app --reload --port 8080
```

### Iniciar y permitir acceso externo
```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### Iniciar en producción (sin reload)
```bash
uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## 📦 Dependencias

### Instalar todas las dependencias
```bash
pip install -r requirements.txt
```

### Instalar paquete específico
```bash
pip install fastapi
```

### Ver dependencias instaladas
```bash
pip list
```

### Actualizar requirements.txt
```bash
pip freeze > requirements.txt
```

---

## 🧪 Testing

### Ejecutar tests (cuando se implementen)
```bash
pytest
```

### Tests con cobertura
```bash
pytest --cov=src
```

---

## 🌐 API

### Documentación Swagger UI
```
http://localhost:8000/docs
```

### Documentación ReDoc
```
http://localhost:8000/redoc
```

### Health check
```bash
curl http://localhost:8000/health
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Listar productos (público)
```bash
curl http://localhost:8000/api/products/catalog
```

---

## 🐛 Debug

### Ver logs del servidor
Los logs aparecen automáticamente en la terminal donde corre `uvicorn`

### Ver variable de entorno
```bash
# Windows PowerShell
$env:DB_PASSWORD

# Linux/Mac
echo $DB_PASSWORD
```

### Configurar variable de entorno temporal
```bash
# Windows PowerShell
$env:DEBUG="False"

# Linux/Mac
export DEBUG=False
```

---

## 🔄 Git

### Estado del repositorio
```bash
git status
```

### Ver archivos ignorados
```bash
git status --ignored
```

### Verificar que .env está ignorado
```bash
git check-ignore .env
# Debe devolver: .env
```

### Commit
```bash
git add .
git commit -m "Descripción del cambio"
```

### Ver historial
```bash
git log --oneline
```

---

## 🛠️ Utilidades

### Ver puertos en uso (Windows)
```powershell
netstat -ano | findstr :8000
```

### Matar proceso por puerto (Windows)
```powershell
# 1. Encontrar PID
netstat -ano | findstr :8000

# 2. Matar proceso (reemplazar PID)
taskkill /PID 12345 /F
```

### Limpiar __pycache__
```bash
# Windows PowerShell
Get-ChildItem -Recurse -Filter "__pycache__" | Remove-Item -Recurse -Force

# Linux/Mac
find . -type d -name "__pycache__" -exec rm -r {} +
```

---

## 📝 Archivos Importantes

| Archivo | Descripción |
|---------|-------------|
| `.env` | Credenciales (NO subir a Git) |
| `.env.example` | Plantilla de configuración |
| `requirements.txt` | Dependencias Python |
| `src/main.py` | Aplicación principal |
| `check_security.py` | Verificación de seguridad |
| `inspect_db.py` | Inspección de base de datos |
| `create_admin.py` | Crear usuario admin |
| `SEGURIDAD.md` | Guía de seguridad |
| `EJEMPLOS_API.md` | Ejemplos de uso API |

---

## 🎯 Flujo de Trabajo Típico

```bash
# 1. Verificar seguridad
python check_security.py

# 2. Iniciar servidor
uvicorn src.main:app --reload

# 3. Abrir navegador
# http://localhost:8000/docs

# 4. Login y obtener token
# Usar Swagger UI para hacer login

# 5. Probar endpoints
# Usar token en "Authorize" de Swagger UI

# 6. Ver logs en terminal del servidor
```

---

## 🚨 Solución de Problemas Comunes

### Error: "DB_PASSWORD must be set"
```bash
# Verificar que .env existe y tiene DB_PASSWORD
cat .env  # o notepad .env

# Debe contener:
DB_PASSWORD=tu_password_aqui
```

### Error: "SECRET_KEY must be changed"
```bash
# Generar nuevo SECRET_KEY
openssl rand -hex 32

# Copiar resultado en .env:
SECRET_KEY=resultado_del_comando
```

### Error: "Port already in use"
```powershell
# Ver qué proceso usa el puerto 8000
netstat -ano | findstr :8000

# Matar el proceso (reemplazar PID)
taskkill /PID 12345 /F
```

### Error: "ModuleNotFoundError"
```bash
# Reinstalar dependencias
pip install -r requirements.txt
```

### Error de conexión a la base de datos
```bash
# Verificar que PostgreSQL está corriendo
# Windows: Services -> PostgreSQL

# Verificar credenciales en .env
notepad .env
```

---

## 📚 Recursos

- **FastAPI**: https://fastapi.tiangolo.com/
- **SQLAlchemy**: https://docs.sqlalchemy.org/
- **Pydantic**: https://docs.pydantic.dev/
- **JWT**: https://jwt.io/

---

## 💡 Tips

1. **Siempre** ejecutar `check_security.py` antes de hacer commit
2. **Nunca** subir `.env` a Git
3. **Cambiar** SECRET_KEY en cada ambiente
4. **Usar** Swagger UI para probar la API
5. **Leer** logs del servidor para debug
