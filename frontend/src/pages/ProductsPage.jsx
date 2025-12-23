import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { productsService } from '../services/api';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio_venta: '',
    stock: '',
    stock_minimo: '5'
  });

  const pageSize = 10;

  useEffect(() => {
    loadProducts();
  }, [page]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productsService.getAll(page * pageSize, pageSize);
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Error al cargar productos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const productData = {
        ...formData,
        precio_venta: parseFloat(formData.precio_venta),
        stock: parseInt(formData.stock),
        stock_minimo: parseInt(formData.stock_minimo)
      };

      if (editingProduct) {
        await productsService.update(editingProduct.id, productData);
      } else {
        await productsService.create(productData);
      }

      setShowModal(false);
      setEditingProduct(null);
      setFormData({
        nombre: '',
        descripcion: '',
        precio_venta: '',
        stock: '',
        stock_minimo: '5'
      });
      loadProducts();
    } catch (err) {
      setError(err.message || 'Error al guardar producto');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      nombre: product.nombre,
      descripcion: product.descripcion || '',
      precio_venta: product.precio_venta.toString(),
      stock: product.stock.toString(),
      stock_minimo: product.stock_minimo.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await productsService.delete(productId);
      loadProducts();
    } catch (err) {
      setError(err.message || 'Error al eliminar producto');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio_venta: '',
      stock: '',
      stock_minimo: '5'
    });
    setShowModal(true);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
          <button
            onClick={handleNewProduct}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <span>+</span>
            Nuevo Producto
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading && !showModal ? (
          <div className="text-center py-8">Cargando...</div>
        ) : (
          <>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Mín.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className={product.stock <= product.stock_minimo ? 'bg-yellow-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{product.nombre}</td>
                      <td className="px-6 py-4">{product.descripcion || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">${parseFloat(product.precio_venta).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={product.stock <= product.stock_minimo ? 'text-red-600 font-bold' : ''}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{product.stock_minimo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {products.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No hay productos registrados
                </div>
              )}
            </div>

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
                disabled={products.length < pageSize}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Descripción</label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Precio de Venta *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="precio_venta"
                    value={formData.precio_venta}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Stock *</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Stock Mínimo *</label>
                    <input
                      type="number"
                      name="stock_minimo"
                      value={formData.stock_minimo}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingProduct(null);
                    }}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Guardando...' : 'Guardar'}
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

export default ProductsPage;
