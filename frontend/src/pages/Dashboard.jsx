import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Define permissions based on role
  const permissions = {
    admin: {
      canManageUsers: true,
      canManageProducts: true,
      canManageClients: true,
      canManageOrders: true,
      canViewInventory: true,
    },
    supervisor: {
      canManageUsers: false,
      canManageProducts: true,
      canManageClients: true,
      canManageOrders: true,
      canViewInventory: true,
    },
    vendedor: {
      canManageUsers: false,
      canManageProducts: false,
      canManageClients: true,
      canManageOrders: true,
      canViewInventory: false,
    },
  };

  // Get user role in lowercase to match permissions object
  const userRol = user?.rol?.toLowerCase() || 'vendedor';
  const userPermissions = permissions[userRol] || permissions.vendedor;

  // Debug: Log user and permissions
  console.log('Usuario:', user);
  console.log('Rol normalizado:', userRol);
  console.log('Permisos:', userPermissions);

  const menuItems = [
    {
      title: 'Clientes',
      description: 'Gestionar clientes y sus contactos',
      icon: '👥',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      path: '/clients',
      visible: userPermissions.canManageClients,
    },
    {
      title: 'Productos',
      description: 'Gestionar productos e inventario',
      icon: '📦',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      path: '/products',
      visible: userPermissions.canManageProducts || userPermissions.canViewInventory,
    },
    {
      title: 'Pedidos',
      description: 'Crear y gestionar pedidos',
      icon: '📋',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      path: '/orders',
      visible: userPermissions.canManageOrders,
    },
    {
      title: 'Usuarios',
      description: 'Administrar usuarios del sistema',
      icon: '⚙️',
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
      path: '/users',
      visible: userPermissions.canManageUsers,
    },
    {
      title: 'Auditoría',
      description: 'Ver acciones de usuarios',
      icon: '📊',
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
      path: '/audit',
      visible: userPermissions.canManageUsers, // Solo admin
    },
  ];

  const visibleItems = menuItems.filter((item) => item.visible);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Bienvenido, {user?.username}
          </h2>
          <p className="text-gray-600">
            Rol: <span className="font-semibold capitalize">{user?.rol}</span>
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`${item.color} ${item.hoverColor} text-white rounded-lg shadow-lg p-6 transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50`}
            >
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
              <p className="text-sm opacity-90">{item.description}</p>
            </button>
          ))}
        </div>

        {/* Role Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-800 mb-3">
            Permisos de tu rol ({user?.rol}):
          </h3>
          <ul className="space-y-2 text-blue-700">
            {userPermissions.canManageUsers && (
              <li>✅ Gestión completa de usuarios</li>
            )}
            {userPermissions.canManageProducts && (
              <li>✅ Crear y editar productos</li>
            )}
            {userPermissions.canViewInventory && !userPermissions.canManageProducts && (
              <li>✅ Ver inventario</li>
            )}
            {userPermissions.canManageClients && (
              <li>✅ Gestionar clientes</li>
            )}
            {userPermissions.canManageOrders && (
              <li>✅ Crear pedidos y registrar pagos</li>
            )}
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
