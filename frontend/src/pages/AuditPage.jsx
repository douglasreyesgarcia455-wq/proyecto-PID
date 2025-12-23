import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { auditService, usersService } from '../services/api';

function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({
    usuario_id: '',
    metodo_http: ''
  });
  const [users, setUsers] = useState([]);

  const pageSize = 20;

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    loadLogs();
  }, [page, filters]);

  const loadUsers = async () => {
    try {
      const result = await usersService.getAll(0, 100);
      if (result.success) {
        setUsers(result.data);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filterData = {};
      if (filters.usuario_id) filterData.usuario_id = parseInt(filters.usuario_id);
      if (filters.metodo_http) filterData.metodo_http = filters.metodo_http;
      
      const data = await auditService.getLogs(page * pageSize, pageSize, filterData);
      setLogs(data);
    } catch (err) {
      setError(err.message || 'Error al cargar logs');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(0); // Reset to first page
  };

  const clearFilters = () => {
    setFilters({
      usuario_id: '',
      metodo_http: ''
    });
    setPage(0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getMethodColor = (method) => {
    const colors = {
      'GET': 'bg-blue-100 text-blue-800',
      'POST': 'bg-green-100 text-green-800',
      'PATCH': 'bg-yellow-100 text-yellow-800',
      'PUT': 'bg-yellow-100 text-yellow-800',
      'DELETE': 'bg-red-100 text-red-800'
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 400 && status < 500) return 'text-yellow-600';
    if (status >= 500) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Auditoría de Acciones</h1>

        {/* Filters */}
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
              <select
                name="usuario_id"
                value={filters.usuario_id}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">Todos</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username} ({user.rol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Método HTTP</label>
              <select
                name="metodo_http"
                value={filters.metodo_http}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">Todos</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PATCH">PATCH</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : (
          <>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endpoint</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiempo (ms)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatDate(log.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {log.username || 'Anónimo'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${getMethodColor(log.metodo_http)}`}>
                            {log.metodo_http}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono">
                          {log.endpoint}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`font-semibold ${getStatusColor(log.status_code)}`}>
                            {log.status_code || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {log.response_time_ms || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.ip_address || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {logs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No hay logs de auditoría
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-4 py-2">Página {page + 1}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={logs.length < pageSize}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default AuditPage;
