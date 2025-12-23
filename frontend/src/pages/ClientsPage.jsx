import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { clientsService } from '../services/api';

const ClientsPage = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
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
    
    console.log('Loading clients...');
    
    const skip = (currentPage - 1) * itemsPerPage;
    const result = await clientsService.getAll(skip, itemsPerPage);

    console.log('Clients result:', result);

    if (result.success) {
      setClients(result.data);
      setTotalClients(result.data.length); // Note: Backend should return total count
    } else {
      setError(result.error);
      console.error('Error loading clients:', result.error);
    }

    setLoading(false);
  };

  const handleSelectClient = (client) => {
    setSelectedClient(client);
  };

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

  const totalPages = Math.ceil(totalClients / itemsPerPage);

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
            ← Volver al Dashboard
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Clients Table */}
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
                  <h3 className="text-lg font-bold text-gray-800 mb-3">
                    Información General
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>ID:</strong> {selectedClient.id}
                    </p>
                    <p>
                      <strong>Nombre:</strong> {selectedClient.nombre}
                    </p>
                    <p>
                      <strong>Dirección:</strong> {selectedClient.calle}
                    </p>
                    <p>
                      <strong>Municipio:</strong> {selectedClient.municipio}
                    </p>
                    <p>
                      <strong>Provincia:</strong> {selectedClient.provincia}
                    </p>
                    {selectedClient.localidad && (
                      <p>
                        <strong>Localidad:</strong> {selectedClient.localidad}
                      </p>
                    )}
                    <p>
                      <strong>Es MIPYME:</strong>{' '}
                      {selectedClient.es_mipyme ? 'Sí' : 'No'}
                    </p>
                    {selectedClient.cuenta_de_pago && (
                      <p>
                        <strong>Cuenta de Pago:</strong>{' '}
                        {selectedClient.cuenta_de_pago}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contacts Table */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">
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
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                Seleccione un cliente de la lista para ver sus detalles y contactos
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClientsPage;
