import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { productsService } from '../services/api';

const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Add product modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio_venta: '',
    stock: '',
    stock_minimo: '5'
  });

  // Reduce stock modal
  const [showReduceStockModal, setShowReduceStockModal] = useState(false);
  const [reduceAmount, setReduceAmount] = useState('');
  const [reducing, setReducing] = useState(false);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadProducts();
  }, [currentPage]);

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    
    const skip = (currentPage - 1) * itemsPerPage;
    const result = await productsService.getAll(skip, itemsPerPage);

    if (result.success) {
      setProducts(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
  };

  // Add product handlers
  const openAddModal = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precio_venta: '',
      stock: '',
      stock_minimo: '5'
    });
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    const productData = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      precio_venta: parseFloat(formData.precio_venta),
      stock: parseInt(formData.stock),
      stock_minimo: parseInt(formData.stock_minimo)
    };
    
    const result = await productsService.create(productData);
    
    if (result.success) {
      setSuccessMessage('Producto creado exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadProducts();
      closeAddModal();
    } else {
      setError(result.error);
    }
    
    setSaving(false);
  };

  // Reduce stock handlers
  const openReduceStockModal = () => {
    if (!selectedProduct) return;
    setReduceAmount('');
    setShowReduceStockModal(true);
  };

  const closeReduceStockModal = () => {
    setShowReduceStockModal(false);
    setReduceAmount('');
  };

  const handleReduceStock = async (e) => {
    e.preventDefault();
    
    const amount = parseInt(reduceAmount);
    if (amount <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }
    
    if (amount > selectedProduct.stock) {
      setError('No puede reducir más del stock actual');
      return;
    }

    setReducing(true);
    setError('');

    const newStock = selectedProduct.stock - amount;
    const result = await productsService.update(selectedProduct.id, {
      stock: newStock
    });

    if (result.success) {
      setSuccessMessage(`Stock reducido en ${amount} unidades`);
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadProducts();
      
      // Update selected product
      const updated = products.find(p => p.id === selectedProduct.id);
      setSelectedProduct(updated);
      
      closeReduceStockModal();
    } else {
      setError(result.error);
    }

    setReducing(false);
  };

  // Delete handlers
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    setDeleting(true);
    setError('');
    
    const result = await productsService.delete(productToDelete.id);
    
    if (result.success) {
      setSuccessMessage('Producto eliminado exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadProducts();
      
      if (selectedProduct?.id === productToDelete.id) {
        setSelectedProduct(null);
      }
      
      setShowDeleteModal(false);
      setProductToDelete(null);
    } else {
      setError(result.error);
    }
    
    setDeleting(false);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  // Pagination
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setSelectedProduct(null);
    }
  };

  const handleNextPage = () => {
    if (products.length === itemsPerPage) {
      setCurrentPage(currentPage + 1);
      setSelectedProduct(null);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Productos</h1>
            <p className="text-gray-600 mt-1">Gestión de inventario</p>
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
          {/* Products Table */}
          <div className="space-y-4">
            <button
              onClick={openAddModal}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition font-semibold flex items-center justify-center gap-2"
            >
              <span className="text-xl">+</span>
              Añadir Producto
            </button>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-blue-600 text-white px-6 py-4">
                <h2 className="text-xl font-bold">Lista de Productos</h2>
              </div>

              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-8 text-center text-gray-500">
                    Cargando productos...
                  </div>
                ) : products.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No se encontraron productos
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Precio
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr
                          key={product.id}
                          onClick={() => handleSelectProduct(product)}
                          className={`cursor-pointer transition ${
                            selectedProduct?.id === product.id
                              ? 'bg-blue-100'
                              : 'hover:bg-gray-50'
                          } ${product.stock <= product.stock_minimo ? 'bg-yellow-50' : ''}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {product.nombre}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${parseFloat(product.precio_venta).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={product.stock <= product.stock_minimo ? 'text-red-600 font-bold' : 'text-gray-900'}>
                              {product.stock}
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
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition"
                >
                  ← Anterior
                </button>
                <span className="text-sm text-gray-700">
                  Página {currentPage}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={products.length < itemsPerPage}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-green-600 text-white px-6 py-4">
              <h2 className="text-xl font-bold">
                {selectedProduct ? 'Detalles del Producto' : 'Seleccione un Producto'}
              </h2>
            </div>

            {selectedProduct ? (
              <div className="p-6">
                {/* Product Info */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Información General
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <strong className="text-gray-600">ID:</strong>
                      <span className="ml-2">{selectedProduct.id}</span>
                    </div>
                    <div>
                      <strong className="text-gray-600">Nombre:</strong>
                      <span className="ml-2">{selectedProduct.nombre}</span>
                    </div>
                    {selectedProduct.descripcion && (
                      <div>
                        <strong className="text-gray-600">Descripción:</strong>
                        <p className="ml-2 text-gray-700">{selectedProduct.descripcion}</p>
                      </div>
                    )}
                    <div>
                      <strong className="text-gray-600">Precio de Venta:</strong>
                      <span className="ml-2 text-green-600 font-bold">
                        ${parseFloat(selectedProduct.precio_venta).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <strong className="text-gray-600">Stock Actual:</strong>
                      <span className={`ml-2 font-bold ${selectedProduct.stock <= selectedProduct.stock_minimo ? 'text-red-600' : 'text-gray-900'}`}>
                        {selectedProduct.stock} unidades
                      </span>
                    </div>
                    <div>
                      <strong className="text-gray-600">Stock Mínimo:</strong>
                      <span className="ml-2">{selectedProduct.stock_minimo} unidades</span>
                    </div>
                    {selectedProduct.stock <= selectedProduct.stock_minimo && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-800 font-semibold">
                          ⚠️ Stock bajo nivel mínimo
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 border-t pt-4">
                  <button
                    onClick={openReduceStockModal}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded transition"
                  >
                    📉 Reducir Stock
                  </button>
                  
                  <button
                    onClick={() => handleDeleteClick(selectedProduct)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
                  >
                    🗑️ Eliminar Producto
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                Seleccione un producto de la lista para ver sus detalles
              </div>
            )}
          </div>
        </div>

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="bg-green-600 text-white px-6 py-4 rounded-t-lg">
                <h3 className="text-xl font-bold">➕ Añadir Nuevo Producto</h3>
              </div>
              
              <form onSubmit={handleSubmitProduct} className="p-6">
                <div className="space-y-4">
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
                      placeholder="Nombre del producto"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Descripción del producto (opcional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio de Venta <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="precio_venta"
                      value={formData.precio_venta}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock Inicial <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock Mínimo <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        name="stock_minimo"
                        value={formData.stock_minimo}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="5"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
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
                    {saving ? 'Guardando...' : 'Guardar Producto'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reduce Stock Modal */}
        {showReduceStockModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="bg-yellow-600 text-white px-6 py-4 rounded-t-lg">
                <h3 className="text-xl font-bold">📉 Reducir Stock</h3>
              </div>
              
              <form onSubmit={handleReduceStock} className="p-6">
                <div className="mb-4 p-4 bg-blue-50 rounded">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Producto:</strong> {selectedProduct.nombre}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Stock actual:</strong> 
                    <span className="ml-2 font-bold text-blue-600">
                      {selectedProduct.stock} unidades
                    </span>
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad a Reducir <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct.stock}
                    value={reduceAmount}
                    onChange={(e) => setReduceAmount(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Máximo: {selectedProduct.stock} unidades
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeReduceStockModal}
                    disabled={reducing}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={reducing}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded transition disabled:opacity-50"
                  >
                    {reducing ? 'Reduciendo...' : 'Reducir Stock'}
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
                  ¿Está seguro que desea eliminar el producto{' '}
                  <strong>{productToDelete?.nombre}</strong>?
                </p>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Advertencia:</strong> Esta acción es irreversible.
                  </p>
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
      </div>
    </Layout>
  );
};

export default ProductsPage;
