import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { ordersService, paymentsService } from '../services/api';

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    monto: '',
    cuenta_origen: '',
    codigo_transfermovil: ''
  });
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadOrders();
  }, [currentPage]);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    
    const skip = (currentPage - 1) * itemsPerPage;
    const result = await ordersService.getAll(skip, itemsPerPage);

    if (result.success) {
      setOrders(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
  };

  const calculatePending = (order) => {
    return (parseFloat(order.total) - parseFloat(order.total_pagado)).toFixed(2);
  };

  // Payment modal handlers
  const openPaymentModal = () => {
    if (!selectedOrder) return;
    
    const pending = calculatePending(selectedOrder);
    setPaymentData({
      monto: pending,
      cuenta_origen: '',
      codigo_transfermovil: ''
    });
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentData({ monto: '', cuenta_origen: '', codigo_transfermovil: '' });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    const pending = parseFloat(calculatePending(selectedOrder));
    const paymentAmount = parseFloat(paymentData.monto);
    
    if (paymentAmount <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }
    
    if (paymentAmount > pending) {
      setError(`El monto no puede ser mayor al pendiente ($${pending.toFixed(2)})`);
      return;
    }

    setProcessingPayment(true);
    setError('');

    const result = await paymentsService.create({
      pedido_id: selectedOrder.id,
      monto: paymentAmount,
      cuenta_origen: paymentData.cuenta_origen,
      codigo_transfermovil: paymentData.codigo_transfermovil
    });

    if (result.success) {
      setSuccessMessage('Pago registrado exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadOrders();
      
      // Update selected order
      const updatedOrder = orders.find(o => o.id === selectedOrder.id);
      setSelectedOrder(updatedOrder);
      
      closePaymentModal();
    } else {
      setError(result.error);
    }

    setProcessingPayment(false);
  };

  // Pagination
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setSelectedOrder(null);
    }
  };

  const handleNextPage = () => {
    if (orders.length === itemsPerPage) {
      setCurrentPage(currentPage + 1);
      setSelectedOrder(null);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Pedidos</h1>
            <p className="text-gray-600 mt-1">Gestión de pedidos y pagos</p>
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
          {/* Orders Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-purple-600 text-white px-6 py-4">
              <h2 className="text-xl font-bold">Lista de Pedidos</h2>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  Cargando pedidos...
                </div>
              ) : orders.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No se encontraron pedidos
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => handleSelectOrder(order)}
                        className={`cursor-pointer transition ${
                          selectedOrder?.id === order.id
                            ? 'bg-purple-100'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.cliente_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                          ${parseFloat(order.total).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.estado === 'pagado'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {order.estado.toUpperCase()}
                          </span>
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
                className="px-4 py-2 bg-purple-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-purple-700 transition"
              >
                ← Anterior
              </button>
              <span className="text-sm text-gray-700">
                Página {currentPage}
              </span>
              <button
                onClick={handleNextPage}
                disabled={orders.length < itemsPerPage}
                className="px-4 py-2 bg-purple-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-purple-700 transition"
              >
                Siguiente →
              </button>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-green-600 text-white px-6 py-4">
              <h2 className="text-xl font-bold">
                {selectedOrder ? `Detalles del Pedido #${selectedOrder.id}` : 'Seleccione un Pedido'}
              </h2>
            </div>

            {selectedOrder ? (
              <div className="p-6">
                {/* Order Summary */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Información General</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">ID Pedido:</p>
                      <p className="font-semibold">#{selectedOrder.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Cliente ID:</p>
                      <p className="font-semibold">{selectedOrder.cliente_id}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Fecha:</p>
                      <p className="font-semibold">
                        {new Date(selectedOrder.fecha_pedido).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Estado:</p>
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          selectedOrder.estado === 'pagado'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {selectedOrder.estado.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="mb-6 p-4 bg-blue-50 rounded">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Resumen de Pagos</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Total del pedido:</span>
                      <span className="font-bold">${parseFloat(selectedOrder.total).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Total pagado:</span>
                      <span className="font-bold text-green-600">
                        ${parseFloat(selectedOrder.total_pagado).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-gray-700 font-bold">Monto pendiente:</span>
                      <span className="font-bold text-red-600 text-lg">
                        ${calculatePending(selectedOrder)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                {selectedOrder.detalles && selectedOrder.detalles.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Productos</h3>
                    <table className="w-full border text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left border">Producto</th>
                          <th className="px-3 py-2 text-center border">Cant.</th>
                          <th className="px-3 py-2 text-right border">P. Unit.</th>
                          <th className="px-3 py-2 text-right border">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.detalles.map((detalle) => (
                          <tr key={detalle.id}>
                            <td className="px-3 py-2 border">Prod. #{detalle.producto_id}</td>
                            <td className="px-3 py-2 text-center border">{detalle.cantidad}</td>
                            <td className="px-3 py-2 text-right border">
                              ${parseFloat(detalle.precio_unitario).toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-right border font-bold">
                              ${parseFloat(detalle.subtotal).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pay Button */}
                {selectedOrder.estado === 'pendiente' && (
                  <div className="pt-4 border-t">
                    <button
                      onClick={openPaymentModal}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded transition font-semibold"
                    >
                      💳 Registrar Pago
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                Seleccione un pedido de la lista para ver sus detalles
              </div>
            )}
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="bg-green-600 text-white px-6 py-4 rounded-t-lg">
                <h3 className="text-xl font-bold">💳 Registrar Pago</h3>
              </div>
              
              <form onSubmit={handlePaymentSubmit} className="p-6">
                <div className="mb-4 p-4 bg-blue-50 rounded">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Pedido:</strong> #{selectedOrder.id}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Total:</strong> ${parseFloat(selectedOrder.total).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Pendiente:</strong> 
                    <span className="text-red-600 font-bold ml-2">
                      ${calculatePending(selectedOrder)}
                    </span>
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monto a Pagar <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={calculatePending(selectedOrder)}
                      value={paymentData.monto}
                      onChange={(e) => setPaymentData({...paymentData, monto: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0.00"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Máximo: ${calculatePending(selectedOrder)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cuenta de Origen <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={paymentData.cuenta_origen}
                      onChange={(e) => setPaymentData({...paymentData, cuenta_origen: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Código de confirmación"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={closePaymentModal}
                    disabled={processingPayment}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={processingPayment}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition disabled:opacity-50"
                  >
                    {processingPayment ? 'Procesando...' : 'Registrar Pago'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrdersPage;
