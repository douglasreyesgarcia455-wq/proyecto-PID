import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const OrdersPage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Pedidos</h1>
            <p className="text-gray-600 mt-1">Crear y gestionar pedidos</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition"
          >
            ← Volver al Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">Módulo de pedidos en desarrollo...</p>
        </div>
      </div>
    </Layout>
  );
};

export default OrdersPage;
