import { useState, useEffect } from 'react';
import { ordersService, productsService } from '../services/api';
import { useNotification } from '../context/NotificationContext';

function SummaryModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [pendingOrders, setPendingOrders] = useState(null);
  const notify = useNotification();

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dailyStats, lowStockData, pendingSummary] = await Promise.all([
        ordersService.getDailyStats(),
        productsService.getLowStock(),
        ordersService.getPendingSummary()
      ]);

      setStats(dailyStats.success ? dailyStats.data : null);
      setLowStock(lowStockData.success ? lowStockData.data : []);
      setPendingOrders(pendingSummary.success ? pendingSummary.data : null);
    } catch (error) {
      console.error('Error loading summary:', error);
      notify.error('Error al cargar resumen');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    try {
      setExporting(true);
      notify.info('📄 Generando PDF...');
      
      const result = await ordersService.exportSummaryPDF();
      
      if (result.success) {
        // Create download link
        const url = window.URL.createObjectURL(result.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = `resumen_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        notify.success('✅ PDF exportado correctamente');
      } else {
        notify.error('Error al exportar PDF: ' + result.error);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      notify.error('Error al exportar PDF');
    } finally {
      setExporting(false);
    }
  };

  const exportToExcel = async () => {
    try {
      setExporting(true);
      notify.info('📊 Generando Excel...');
      
      const result = await ordersService.exportSummaryExcel();
      
      if (result.success) {
        // Create download link
        const url = window.URL.createObjectURL(result.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = `resumen_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        notify.success('✅ Excel exportado correctamente');
      } else {
        notify.error('Error al exportar Excel: ' + result.error);
      }
    } catch (error) {
      console.error('Error exporting Excel:', error);
      notify.error('Error al exportar Excel');
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">📊 Resumen del Sistema</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">Cargando...</div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Ventas del Día */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
              <h3 className="text-xl font-bold text-green-800 mb-4">💰 Ventas del Día</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 shadow">
                  <p className="text-gray-600 text-sm">Total Pedidos</p>
                  <p className="text-2xl font-bold text-green-700">{stats?.total_orders || 0}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow">
                  <p className="text-gray-600 text-sm">Ventas Totales</p>
                  <p className="text-2xl font-bold text-green-700">${stats?.total_sales?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow">
                  <p className="text-gray-600 text-sm">Cobrado</p>
                  <p className="text-2xl font-bold text-blue-700">${stats?.total_collected?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow">
                  <p className="text-gray-600 text-sm">Pagos</p>
                  <p className="text-2xl font-bold text-purple-700">{stats?.payments_count || 0}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white rounded-lg p-4 shadow">
                  <p className="text-gray-600 text-sm">Pedidos Pagados</p>
                  <p className="text-xl font-bold text-green-600">{stats?.paid_orders || 0}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow">
                  <p className="text-gray-600 text-sm">Pedidos Pendientes</p>
                  <p className="text-xl font-bold text-yellow-600">{stats?.pending_orders || 0}</p>
                </div>
              </div>
            </div>

            {/* Pedidos Pendientes */}
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
              <h3 className="text-xl font-bold text-yellow-800 mb-4">⏳ Pedidos Pendientes de Pago</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 shadow">
                  <p className="text-gray-600 text-sm">Cantidad</p>
                  <p className="text-2xl font-bold text-yellow-700">{pendingOrders?.count || 0}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow">
                  <p className="text-gray-600 text-sm">Monto Total</p>
                  <p className="text-2xl font-bold text-yellow-700">${pendingOrders?.total_amount?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </div>

            {/* Alertas de Stock Bajo */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
              <h3 className="text-xl font-bold text-red-800 mb-4">⚠️ Alertas de Stock Bajo ({lowStock.length})</h3>
              {lowStock.length === 0 ? (
                <p className="text-gray-600">No hay productos con stock bajo</p>
              ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-red-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-red-800">Producto</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-red-800">Stock</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-red-800">Mínimo</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-red-800">Precio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {lowStock.map((product) => (
                        <tr key={product.id} className="hover:bg-red-50">
                          <td className="px-4 py-3 text-sm">{product.nombre}</td>
                          <td className="px-4 py-3">
                            <span className={`font-bold ${product.stock === 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{product.stock_minimo}</td>
                          <td className="px-4 py-3 text-sm font-medium">${product.precio_venta.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Botones de Exportación */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📄 Exportar Resumen</h3>
              <div className="flex gap-4">
                <button
                  onClick={exportToPDF}
                  disabled={exporting}
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exporting ? '⏳ Exportando...' : '📄 Exportar a PDF'}
                </button>
                <button
                  onClick={exportToExcel}
                  disabled={exporting}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exporting ? '⏳ Exportando...' : '📊 Exportar a Excel'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-100 p-4 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            disabled={exporting}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default SummaryModal;
