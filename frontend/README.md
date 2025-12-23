# Frontend - Sistema de Gestión de Pedidos

Frontend desarrollado con **React + Vite + Tailwind CSS**.

## 🚀 Instalación

### 1. Instalar Node.js
Descargar desde: https://nodejs.org/ (versión LTS recomendada)

### 2. Instalar dependencias
```bash
cd frontend
npm install
```

### 3. Iniciar servidor de desarrollo
```bash
npm run dev
```

El frontend estará disponible en: http://localhost:3000

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/      # Componentes reutilizables
│   │   ├── Layout.jsx   # Layout principal con navbar
│   │   └── PrivateRoute.jsx  # Protección de rutas
│   ├── pages/           # Páginas principales
│   │   ├── Login.jsx    # Página de login
│   │   ├── Dashboard.jsx  # Panel principal con botones por rol
│   │   ├── ClientsPage.jsx  # Gestión de clientes (paginado + contactos)
│   │   ├── ProductsPage.jsx
│   │   ├── OrdersPage.jsx
│   │   └── UsersPage.jsx
│   ├── context/         # Contextos de React
│   │   └── AuthContext.jsx  # Autenticación
│   ├── services/        # Servicios de API
│   │   └── api.js       # Conexión con backend
│   ├── App.jsx          # Aplicación principal
│   └── main.jsx         # Punto de entrada
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎨 Características Implementadas

### ✅ Autenticación
- Login con JWT
- Almacenamiento de token en localStorage
- Redirección automática si no está autenticado
- Logout

### ✅ Dashboard Principal
- Botones dinámicos según rol del usuario
- **Admin**: Acceso completo (Clientes, Productos, Pedidos, Usuarios)
- **Supervisor**: Clientes, Productos, Pedidos
- **Vendedor**: Solo Clientes y Pedidos
- Información de permisos por rol

### ✅ Página de Clientes
- ✅ Tabla de clientes con paginación (10 por página)
- ✅ Selección de cliente
- ✅ Tabla de contactos del cliente seleccionado
- ✅ Manejo de errores
- Botones: Anterior/Siguiente

### 🔄 Gestión de Estados
- Loading states
- Error handling
- Mensajes de éxito/error

## 🔐 Roles y Permisos

| Funcionalidad | Admin | Supervisor | Vendedor |
|--------------|-------|------------|----------|
| Dashboard | ✅ | ✅ | ✅ |
| Gestión de Clientes | ✅ | ✅ | ✅ |
| Gestión de Productos | ✅ | ✅ | ❌ |
| Gestión de Pedidos | ✅ | ✅ | ✅ |
| Gestión de Usuarios | ✅ | ❌ | ❌ |

## 🌐 Conexión con Backend

El frontend se conecta al backend en: `http://localhost:8000`

Configurado en `vite.config.js` con proxy:
```javascript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    }
  }
}
```

## 📡 Servicios de API

Todos los servicios están en `src/services/api.js`:

- `authService.login(username, password)`
- `clientsService.getAll(skip, limit)`
- `clientsService.getById(clientId)`
- `productsService.getAll()`
- `ordersService.getAll()`
- `usersService.getAll()`

## 🎨 Estilos

Usando **Tailwind CSS** con clases utilitarias.

Colores principales:
- Azul: Clientes
- Verde: Productos
- Púrpura: Pedidos
- Rojo: Usuarios/Admin

## 🧪 Usuarios de Prueba

```
Admin:
Usuario: admin
Contraseña: admin123

(Crear más usuarios desde el panel de admin)
```

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## 🔧 Configuración

### Variables de Entorno (opcional)
Crear `.env` en la carpeta `frontend`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## 🚀 Próximos Pasos

- [ ] Implementar CRUD completo de productos
- [ ] Implementar creación de pedidos
- [ ] Implementar registro de pagos
- [ ] Implementar gestión de usuarios (admin)
- [ ] Agregar gráficos y estadísticas
- [ ] Agregar búsqueda y filtros
- [ ] Agregar modales para crear/editar
- [ ] Agregar confirmaciones de eliminación

## 🐛 Troubleshooting

### El frontend no se conecta al backend
- Verificar que el backend está corriendo en http://localhost:8000
- Verificar CORS en el backend (debe permitir http://localhost:3000)

### Error al instalar dependencias
```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error de compilación
```bash
# Limpiar build
npm run build
```

## 📚 Tecnologías

- **React 18** - Framework UI
- **Vite** - Build tool
- **React Router 6** - Navegación
- **Tailwind CSS** - Estilos
- **Axios** - HTTP client
