import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Request interceptor - Token:', token ? 'exists' : 'missing');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('Response error:', error.response?.status, error.response?.data);
    
    // Only redirect to login on 401 for unhandled errors
    // Services that handle errors themselves should not trigger redirect
    if (error.response?.status === 401) {
      // Check if the error is being handled by a service (has custom error handling)
      // If the caller is handling it, don't redirect
      if (!error.config._retry) {
        console.log('401 error - redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  login: async (username, password) => {
    const response = await api.post('/api/auth/login', { username, password });
    return response.data;
  },
};

// Clients Service
export const clientsService = {
  getAll: async (skip = 0, limit = 10) => {
    try {
      const response = await api.get(`/api/clients/?skip=${skip}&limit=${limit}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al obtener clientes'
      };
    }
  },

  getById: async (clientId) => {
    try {
      const response = await api.get(`/api/clients/${clientId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al obtener cliente'
      };
    }
  },

  create: async (clientData) => {
    try {
      const response = await api.post('/api/clients/', clientData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al crear cliente'
      };
    }
  },

  update: async (clientId, clientData) => {
    try {
      const response = await api.patch(`/api/clients/${clientId}`, clientData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al actualizar cliente'
      };
    }
  },

  delete: async (clientId) => {
    try {
      const response = await api.delete(`/api/clients/${clientId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al eliminar cliente'
      };
    }
  },
};

// Products Service
export const productsService = {
  getAll: async (skip = 0, limit = 100) => {
    try {
      const response = await api.get(`/api/products/?skip=${skip}&limit=${limit}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al obtener productos'
      };
    }
  },

  getCatalog: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products/catalog`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al obtener catálogo'
      };
    }
  },

  getLowStock: async () => {
    try {
      const response = await api.get('/api/products/low-stock');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al obtener productos con stock bajo'
      };
    }
  },

  create: async (productData) => {
    try {
      const response = await api.post('/api/products/', productData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al crear producto'
      };
    }
  },

  update: async (productId, productData) => {
    try {
      const response = await api.patch(`/api/products/${productId}`, productData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al actualizar producto'
      };
    }
  },

  delete: async (productId) => {
    try {
      const response = await api.delete(`/api/products/${productId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al eliminar producto'
      };
    }
  },

  getLowStock: async () => {
    try {
      const response = await api.get('/api/products/alerts/low-stock');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al obtener productos con stock bajo'
      };
    }
  },
};

// Orders Service
export const ordersService = {
  getAll: async (skip = 0, limit = 100) => {
    try {
      const response = await api.get(`/api/orders/?skip=${skip}&limit=${limit}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al obtener pedidos'
      };
    }
  },

  getById: async (orderId) => {
    try {
      const response = await api.get(`/api/orders/${orderId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al obtener pedido'
      };
    }
  },

  create: async (orderData) => {
    try {
      const response = await api.post('/api/orders/', orderData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al crear pedido'
      };
    }
  },

  getDailyStats: async (targetDate = null) => {
    try {
      const url = targetDate 
        ? `/api/orders/stats/daily?target_date=${targetDate}`
        : '/api/orders/stats/daily';
      const response = await api.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al obtener estadísticas'
      };
    }
  },

  getPendingSummary: async () => {
    try {
      const response = await api.get('/api/orders/stats/pending-summary');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al obtener resumen de pendientes'
      };
    }
  },

  getMonthlyStats: async (year = null, month = null) => {
    try {
      let url = '/api/orders/stats/monthly';
      if (year && month) {
        url += `?year=${year}&month=${month}`;
      }
      const response = await api.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al obtener estadísticas mensuales'
      };
    }
  },

  exportSummaryPDF: async () => {
    try {
      const response = await api.get('/api/orders/export/summary-pdf', {
        responseType: 'blob'
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al exportar PDF'
      };
    }
  },

  exportSummaryExcel: async () => {
    try {
      const response = await api.get('/api/orders/export/summary-excel', {
        responseType: 'blob'
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al exportar Excel'
      };
    }
  },
};

// Payments Service
export const paymentsService = {
  getByOrder: async (orderId) => {
    try {
      const response = await api.get(`/api/payments/order/${orderId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al obtener pagos'
      };
    }
  },

  getSummary: async (orderId) => {
    try {
      const response = await api.get(`/api/payments/order/${orderId}/summary`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al obtener resumen de pagos'
      };
    }
  },

  create: async (paymentData) => {
    try {
      const response = await api.post('/api/payments/', paymentData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al registrar pago'
      };
    }
  },
};

// Users Service
export const usersService = {
  getAll: async (skip = 0, limit = 100) => {
    try {
      const response = await api.get(`/api/users/?skip=${skip}&limit=${limit}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al obtener usuarios'
      };
    }
  },

  getMe: async () => {
    try {
      const response = await api.get('/api/users/me');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al obtener usuario actual'
      };
    }
  },

  create: async (userData) => {
    try {
      const response = await api.post('/api/users/', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al crear usuario'
      };
    }
  },

  update: async (userId, userData) => {
    try {
      const response = await api.patch(`/api/users/${userId}`, userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al actualizar usuario'
      };
    }
  },

  delete: async (userId) => {
    try {
      const response = await api.delete(`/api/users/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al eliminar usuario'
      };
    }
  },
};

// Audit Service
export const auditService = {
  getLogs: async (skip = 0, limit = 100, filters = {}) => {
    try {
      let url = `/api/audit/logs?skip=${skip}&limit=${limit}`;
      if (filters.usuario_id) {
        url += `&usuario_id=${filters.usuario_id}`;
      }
      if (filters.metodo_http) {
        url += `&metodo_http=${filters.metodo_http}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Error al obtener logs de auditoría');
    }
  },

  getUserLogs: async (userId, skip = 0, limit = 100) => {
    try {
      const response = await api.get(`/api/audit/users/${userId}/logs?skip=${skip}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Error al obtener logs del usuario');
    }
  },
};

export default api;
