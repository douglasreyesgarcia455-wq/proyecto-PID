import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { clientsService, productsService, ordersService } from '../services/api';
import { useNotification } from '../context/NotificationContext';

const ClientsPage = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  // Add client modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    calle: '',
    municipio: '',
    provincia: '',
    localidad: '',
    es_mipyme: false,
    cuenta_de_pago: '',
    contactos: [
      { tipo: 'telefono', valor: '' },
      { tipo: 'email', valor: '' }
    ]
  });

  // Add order modal
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [payNow, setPayNow] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cuenta_origen: '',
    codigo_transfermovil: ''
  });
  const [creatingOrder, setCreatingOrder] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalClients, setTotalClients] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    loadClients();
  }, [currentPage]);

  const loadClients = async () => {
    setLoading(true);
    setError('');
    
    const skip = (currentPage - 1) * itemsPerPage;
    const result = await clientsService.getAll(skip, itemsPerPage);

    if (result.success) {
      setClients(result.data);
      setTotalClients(result.data.length);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleSelectClient = (client) => {
    setSelectedClient(client);
  };

  // Order modal handlers
  const openOrderModal = async () => {
    if (!selectedClient) return;
    
    // Load products
    const result = await productsService.getAll(0, 100);
    if (result.success) {
      setProducts(result.data.filter(p => p.stock > 0));
    }
    
    setOrderItems([]);
    setPayNow(false);
    setPaymentData({ cuenta_origen: '', codigo_transfermovil: '' });
    setShowOrderModal(true);
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setOrderItems([]);
    setPayNow(false);
    setPaymentData({ cuenta_origen: '', codigo_transfermovil: '' });
  };

  const addOrderItem = (product) => {
    const existing = orderItems.find(item => item.producto_id === product.id);
    if (existing) {
      setOrderItems(orderItems.map(item =>
        item.producto_id === product.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setOrderItems([...orderItems, {
        producto_id: product.id,
        nombre: product.nombre,
        precio_unitario: parseFloat(product.precio_venta),
        cantidad: 1,
        stock_disponible: product.stock
      }]);
    }
  };

  const updateOrderItemQuantity = (productoId, cantidad) => {
    if (cantidad <= 0) {
      setOrderItems(orderItems.filter(item => item.producto_id !== productoId));
    } else {
      setOrderItems(orderItems.map(item =>
        item.producto_id === productoId
          ? { ...item, cantidad: parseInt(cantidad) }
          : item
      ));
    }
  };

  const removeOrderItem = (productoId) => {
    setOrderItems(orderItems.filter(item => item.producto_id !== productoId));
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);
  };

  const handleCreateOrder = async () => {
    if (orderItems.length === 0) {
      setError('Debe agregar al menos un producto al pedido');
      return;
    }

    if (payNow && (!paymentData.cuenta_origen || !paymentData.codigo_transfermovil)) {
      setError('Debe ingresar cuenta de origen y código de Transfermóvil');
      return;
    }

    setCreatingOrder(true);
    setError('');

    const orderData = {
      cliente_id: selectedClient.id,
      detalles: orderItems.map(item => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario
      })),
      pago_inmediato: payNow,
      ...(payNow && {
        pago: {
          monto: calculateTotal(),
          cuenta_origen: paymentData.cuenta_origen,
          codigo_transfermovil: paymentData.codigo_transfermovil
        }
      })
    };

    const result = await ordersService.create(orderData);

    if (result.success) {
      // Mostrar notificación
      notify.success(`🎉 Pedido creado exitosamente para ${selectedClient.nombre}. Estado: ${payNow ? 'Pagado' : 'Pendiente'}`);
      
      setSuccessMessage(`Pedido creado exitosamente. Estado: ${payNow ? 'Pagado' : 'Pendiente'}`);
      setTimeout(() => setSuccessMessage(''), 3000);
      closeOrderModal();
    } else {
      setError(result.error);
      notify.error('❌ Error al crear pedido: ' + result.error);
    }

    setCreatingOrder(false);
  };

  // Add client handlers
  const openAddModal = () => {
    setFormData({
      nombre: '',
      calle: '',
      municipio: '',
      provincia: '',
      localidad: '',
      es_mipyme: false,
      cuenta_de_pago: '',
      contactos: [
        { tipo: 'telefono', valor: '' },
        { tipo: 'email', valor: '' }
      ]
    });
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContactChange = (index, field, value) => {
    const newContactos = [...formData.contactos];
    newContactos[index][field] = value;
    setFormData(prev => ({ ...prev, contactos: newContactos }));
  };

  const addContact = () => {
    setFormData(prev => ({
      ...prev,
      contactos: [...prev.contactos, { tipo: 'telefono', valor: '' }]
    }));
  };

  const removeContact = (index) => {
    if (formData.contactos.length > 1) {
      setFormData(prev => ({
        ...prev,
        contactos: prev.contactos.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmitClient = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    // Filter out empty contacts
    const clientData = {
      ...formData,
      contactos: formData.contactos.filter(c => c.valor.trim() !== '')
    };
    
    const result = await clientsService.create(clientData);
    
    if (result.success) {
      setSuccessMessage('Cliente creado exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadClients();
      closeAddModal();
    } else {
      setError(result.error);
    }
    
    setSaving(false);
  };

  // Delete handlers
  const handleDeleteClick = (client) => {
    setClientToDelete(client);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;
    
    setDeleting(true);
    setError('');
    
    const result = await clientsService.delete(clientToDelete.id);
    
    if (result.success) {
      setSuccessMessage('Cliente eliminado exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadClients();
      
      if (selectedClient?.id === clientToDelete.id) {
        setSelectedClient(null);
      }
      
      setShowDeleteModal(false);
      setClientToDelete(null);
    } else {
      setError(result.error);
    }
    
    setDeleting(false);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setClientToDelete(null);
  };

  // Pagination
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setSelectedClient(null);
    }
  };

  const handleNextPage = () => {
    if (clients.length === itemsPerPage) {
      setCurrentPage(currentPage + 1);
      setSelectedClient(null);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
            <p className="text-gray-600 mt-1">Gestión de clientes y contactos</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition"
          >
            ← Volver
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Clients Table */}
          <div className="space-y-4">
            <button
              onClick={openAddModal}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition font-semibold flex items-center justify-center gap-2"
            >
              <span className="text-xl">+</span>
              Añadir Cliente
            </button>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-blue-600 text-white px-6 py-4">
                <h2 className="text-xl font-bold">Lista de Clientes</h2>
              </div>

              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-8 text-center text-gray-500">
                    Cargando clientes...
                  </div>
                ) : clients.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No se encontraron clientes
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Municipio
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          MIPYME
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {clients.map((client) => (
                        <tr
                          key={client.id}
                          onClick={() => handleSelectClient(client)}
                          className={`cursor-pointer transition ${
                            selectedClient?.id === client.id
                              ? 'bg-blue-100'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {client.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {client.nombre}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {client.municipio}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {client.es_mipyme ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Sí
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                No
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition"
                >
                  ← Anterior
                </button>
                <span className="text-sm text-gray-700">
                  Página {currentPage}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={clients.length < itemsPerPage}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          </div>

          {/* Client Details and Contacts */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-green-600 text-white px-6 py-4">
              <h2 className="text-xl font-bold">
                {selectedClient ? 'Detalles del Cliente' : 'Seleccione un Cliente'}
              </h2>
            </div>

            {selectedClient ? (
              <div className="p-6">
                {/* Client Info */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Información General
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-3">
                      <p>
                        <strong className="text-gray-600">ID:</strong>
                        <span className="ml-2">{selectedClient.id}</span>
                      </p>
                      <p>
                        <strong className="text-gray-600">Nombre:</strong>
                        <span className="ml-2">{selectedClient.nombre}</span>
                      </p>
                      <p>
                        <strong className="text-gray-600">Dirección:</strong>
                        <span className="ml-2">{selectedClient.calle}</span>
                      </p>
                    </div>
                    <div className="space-y-3">
                      <p>
                        <strong className="text-gray-600">Municipio:</strong>
                        <span className="ml-2">{selectedClient.municipio}</span>
                      </p>
                      <p>
                        <strong className="text-gray-600">Provincia:</strong>
                        <span className="ml-2">{selectedClient.provincia}</span>
                      </p>
                      {selectedClient.localidad && (
                        <p>
                          <strong className="text-gray-600">Localidad:</strong>
                          <span className="ml-2">{selectedClient.localidad}</span>
                        </p>
                      )}
                      <p>
                        <strong className="text-gray-600">Es MIPYME:</strong>
                        <span className="ml-2">
                          {selectedClient.es_mipyme ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              Sí
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                              No
                            </span>
                          )}
                        </span>
                      </p>
                      {selectedClient.cuenta_de_pago && (
                        <p>
                          <strong className="text-gray-600">Cuenta de Pago:</strong>
                          <span className="ml-2">{selectedClient.cuenta_de_pago}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contacts Table */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Contactos
                  </h3>
                  {selectedClient.contactos && selectedClient.contactos.length > 0 ? (
                    <table className="w-full border">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border">
                            Tipo
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border">
                            Valor
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedClient.contactos.map((contacto) => (
                          <tr key={contacto.id} className="border-t">
                            <td className="px-4 py-2 text-sm border">
                              <span
                                className={`px-2 py-1 rounded ${
                                  contacto.tipo === 'telefono'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-purple-100 text-purple-800'
                                }`}
                              >
                                {contacto.tipo === 'telefono' ? '📞' : '📧'}{' '}
                                {contacto.tipo}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm border">
                              {contacto.valor}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No hay contactos registrados para este cliente.
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t space-y-3">
                  <button
                    onClick={openOrderModal}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition flex items-center justify-center gap-2"
                  >
                    📝 Agregar Pedido
                  </button>
                  
                  <button
                    onClick={() => handleDeleteClick(selectedClient)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
                  >
                    🗑️ Eliminar Cliente
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                Seleccione un cliente de la lista para ver sus detalles y contactos
              </div>
            )}
          </div>
        </div>

        {/* Add Client Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 my-8">
              <div className="bg-green-600 text-white px-6 py-4 rounded-t-lg">
                <h3 className="text-xl font-bold">➕ Añadir Nuevo Cliente</h3>
              </div>
              
              <form onSubmit={handleSubmitClient} className="p-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Nombre del cliente"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Calle <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="calle"
                      value={formData.calle}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Dirección"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Municipio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="municipio"
                      value={formData.municipio}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Municipio"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Provincia <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="provincia"
                      value={formData.provincia}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Provincia"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Localidad
                    </label>
                    <input
                      type="text"
                      name="localidad"
                      value={formData.localidad}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Localidad (opcional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cuenta de Pago
                    </label>
                    <input
                      type="text"
                      name="cuenta_de_pago"
                      value={formData.cuenta_de_pago}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Número de cuenta"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="es_mipyme"
                      checked={formData.es_mipyme}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Es MIPYME
                    </span>
                  </label>
                </div>

                {/* Contacts */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-md font-bold text-gray-800">Contactos</h4>
                    <button
                      type="button"
                      onClick={addContact}
                      className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      + Añadir Contacto
                    </button>
                  </div>
                  
                  {formData.contactos.map((contacto, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <select
                        value={contacto.tipo}
                        onChange={(e) => handleContactChange(index, 'tipo', e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2"
                      >
                        <option value="telefono">Teléfono</option>
                        <option value="email">Email</option>
                      </select>
                      <input
                        type="text"
                        value={contacto.valor}
                        onChange={(e) => handleContactChange(index, 'valor', e.target.value)}
                        placeholder={contacto.tipo === 'email' ? 'email@ejemplo.com' : '+53 5X XXX XXX'}
                        className="flex-1 border border-gray-300 rounded px-3 py-2"
                      />
                      {formData.contactos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeContact(index)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeAddModal}
                    disabled={saving}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : 'Guardar Cliente'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="bg-red-600 text-white px-6 py-4 rounded-t-lg">
                <h3 className="text-xl font-bold">⚠️ Confirmar Eliminación</h3>
              </div>
              
              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  ¿Está seguro que desea eliminar al cliente{' '}
                  <strong>{clientToDelete?.nombre}</strong>?
                </p>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Advertencia:</strong> Esta acción es irreversible y eliminará:
                  </p>
                  <ul className="text-sm text-yellow-700 list-disc list-inside mt-2">
                    <li>El cliente y sus datos</li>
                    <li>Todos los pedidos asociados</li>
                    <li>Todos los pagos de esos pedidos</li>
                    <li>El historial de auditoría relacionado</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={cancelDelete}
                    disabled={deleting}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleting}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition disabled:opacity-50"
                  >
                    {deleting ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Order Modal */}
        {showOrderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 my-8">
              <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
                <h3 className="text-xl font-bold">📝 Nuevo Pedido para {selectedClient?.nombre}</h3>
              </div>
              
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {/* Products Selection */}
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-800 mb-3">Seleccionar Productos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {products.map(product => (
                      <div
                        key={product.id}
                        className="border rounded p-3 hover:bg-gray-50 cursor-pointer"
                        onClick={() => addOrderItem(product)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-gray-800">{product.nombre}</p>
                            <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">${parseFloat(product.precio_venta).toFixed(2)}</p>
                            <button className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                              + Agregar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Items */}
                {orderItems.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-3">Productos Seleccionados</h4>
                    <table className="w-full border">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left border">Producto</th>
                          <th className="px-4 py-2 text-center border">Cantidad</th>
                          <th className="px-4 py-2 text-right border">Precio Unit.</th>
                          <th className="px-4 py-2 text-right border">Subtotal</th>
                          <th className="px-4 py-2 text-center border">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderItems.map(item => (
                          <tr key={item.producto_id}>
                            <td className="px-4 py-2 border">{item.nombre}</td>
                            <td className="px-4 py-2 border text-center">
                              <input
                                type="number"
                                min="1"
                                max={item.stock_disponible}
                                value={item.cantidad}
                                onChange={(e) => updateOrderItemQuantity(item.producto_id, e.target.value)}
                                className="w-20 border rounded px-2 py-1 text-center"
                              />
                            </td>
                            <td className="px-4 py-2 border text-right">${item.precio_unitario.toFixed(2)}</td>
                            <td className="px-4 py-2 border text-right font-bold">
                              ${(item.precio_unitario * item.cantidad).toFixed(2)}
                            </td>
                            <td className="px-4 py-2 border text-center">
                              <button
                                onClick={() => removeOrderItem(item.producto_id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-100">
                          <td colSpan="3" className="px-4 py-3 border text-right font-bold">TOTAL:</td>
                          <td className="px-4 py-3 border text-right font-bold text-lg text-green-600">
                            ${calculateTotal().toFixed(2)}
                          </td>
                          <td className="border"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Payment Options */}
                {orderItems.length > 0 && (
                  <div className="mb-6 border-t pt-6">
                    <div className="mb-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={payNow}
                          onChange={(e) => setPayNow(e.target.checked)}
                          className="mr-3 w-5 h-5"
                        />
                        <span className="text-lg font-semibold text-gray-800">
                          💳 Pagar Ahora
                        </span>
                      </label>
                    </div>

                    {payNow && (
                      <div className="bg-green-50 border border-green-200 rounded p-4">
                        <h5 className="font-bold text-gray-800 mb-3">Datos del Pago</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Cuenta de Origen <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={paymentData.cuenta_origen}
                              onChange={(e) => setPaymentData({...paymentData, cuenta_origen: e.target.value})}
                              className="w-full border border-gray-300 rounded px-3 py-2"
                              placeholder="Número de cuenta o tarjeta"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Código Transfermóvil <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={paymentData.codigo_transfermovil}
                              onChange={(e) => setPaymentData({...paymentData, codigo_transfermovil: e.target.value})}
                              className="w-full border border-gray-300 rounded px-3 py-2"
                              placeholder="Código de confirmación"
                              required
                            />
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          ✅ El pedido se marcará como <strong>PAGADO</strong>
                        </p>
                      </div>
                    )}

                    {!payNow && orderItems.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                        <p className="text-sm text-yellow-800">
                          ⏳ El pedido se creará con estado <strong>PENDIENTE</strong>. 
                          Podrá registrar el pago desde el panel de pedidos.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex gap-3">
                <button
                  onClick={closeOrderModal}
                  disabled={creatingOrder}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateOrder}
                  disabled={creatingOrder || orderItems.length === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition disabled:opacity-50 disabled:bg-gray-400"
                >
                  {creatingOrder ? 'Creando...' : 'Crear Pedido'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ClientsPage;
