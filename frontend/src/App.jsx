import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ClientsPage from './pages/ClientsPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import UsersPage from './pages/UsersPage';
import AuditPage from './pages/AuditPage';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/clients" element={
            <PrivateRoute>
              <ClientsPage />
            </PrivateRoute>
          } />
          <Route path="/products" element={
            <PrivateRoute>
              <ProductsPage />
            </PrivateRoute>
          } />
          <Route path="/orders" element={
            <PrivateRoute>
              <OrdersPage />
            </PrivateRoute>
          } />
          <Route path="/users" element={
            <PrivateRoute requiredRole="admin">
              <UsersPage />
            </PrivateRoute>
          } />
          <Route path="/audit" element={
            <PrivateRoute requiredRole="admin">
              <AuditPage />
            </PrivateRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
