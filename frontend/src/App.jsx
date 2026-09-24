import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { AC1 } from './pages/AC1';
import { AC2 } from './pages/AC2';

export default function App() {
  const [autenticado, setAutenticado] = useState(() => {
    return localStorage.getItem('usuarioLogado') === 'true';
  });

  const handleLogin = () => {
    localStorage.setItem('usuarioLogado', 'true');
    setAutenticado(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('usuarioLogado');
    setAutenticado(false);
  };

  return (
    <BrowserRouter>
      {autenticado && (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem', background: '#f4f4f4', alignItems: 'center' }}>
          <strong>Clube do Livro</strong>
          <button onClick={handleLogout} style={{ cursor: 'pointer' }}>Sair</button>
        </div>
      )}

      <Routes>
        <Route 
          path="/login" 
          element={!autenticado ? <Login onLogin={handleLogin} /> : <Navigate to="/home" />} 
        />
        <Route 
          path="/home" 
          element={autenticado ? <Home /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/ac1" 
          element={autenticado ? <AC1 /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/ac2" 
          element={autenticado ? <AC2 /> : <Navigate to="/login" />} 
        />
        <Route 
          path="*" 
          element={<Navigate to={autenticado ? "/home" : "/login"} />} 
        />
      </Routes>
    </BrowserRouter>
  );
}