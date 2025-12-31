import React, { useState, useEffect } from 'react'; // Adicionado useState e useEffect
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import Registration from './components/Registration';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

// Rota Protegida para Admin com verificação de carregamento
const AdminRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStorage = localStorage.getItem('user');
    if (userStorage) {
      try {
        setUser(JSON.parse(userStorage));
      } catch (e) {
        console.error("Erro ao ler dados do usuário", e);
        localStorage.removeItem('user'); // Limpa se estiver corrompido
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white">Carregando...</div>; 
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  
  return children;
};

// Rota Privada Padrão com verificação de carregamento
const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStorage = localStorage.getItem('user');
    setIsAuthenticated(!!userStorage);
    setLoading(false);
  }, []);

  if (loading) {
    return null; // Ou um spinner simples
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/dashboard" element={
          <PrivateRoute>
            <UserDashboard />
          </PrivateRoute>
        } />
        
        <Route path="/event/:id/register" element={
          <PrivateRoute>
            <Registration />
          </PrivateRoute>
        } />
        
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;