// src/contexts/authContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Nuevo estado para el objeto completo del usuario
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Login original, pero tras guardar tokens, traemos el perfil
  const login = async (username, password) => {
    const res = await fetch(`${API_URL}/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = Object.values(data).flat().join(' ') || data.detail || 'Error al iniciar sesión';
      throw new Error(msg);
    }
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);

    // Ahora traemos el perfil
    const perfilRes = await fetch(`${API_URL}/perfil/`, {
      headers: { Authorization: `Bearer ${data.access}` }
    });
    const perfilData = await perfilRes.json();
    if (!perfilRes.ok) {
      throw new Error('No se pudo obtener perfil.');
    }
    setUser(perfilData);
    navigate('/');
  };

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
    navigate('/login');
  };

  // fetchWithAuth igual que antes, pero devolviendo { status, data }
  const fetchWithAuth = async (path, options = {}) => {
    const url = `${API_URL}${path}`;
    let headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${localStorage.getItem('access')}`,
    };

    let res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      // intento de refresh
      const refreshRes = await fetch(`${API_URL}/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: localStorage.getItem('refresh') }),
      });
      const refreshData = await refreshRes.json();
      if (!refreshRes.ok) {
        logout();
        throw new Error('Sesión expirada. Por favor inicia sesión de nuevo.');
      }
      localStorage.setItem('access', refreshData.access);
      headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${refreshData.access}`,
      };
      res = await fetch(url, { ...options, headers });
    }

    const data = await res.json();
    if (!res.ok) {
      const msg = Object.values(data).flat().join(' ') || data.detail || 'Error en la petición';
      throw new Error(msg);
    }
    return { status: res.status, data };
  };

  // Al montar, si hay token, traemos perfil automáticamente
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('access');
      if (token) {
        try {
          const perfilRes = await fetch(`${API_URL}/perfil/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const perfilData = await perfilRes.json();
          if (perfilRes.ok) setUser(perfilData);
          else setUser(null);
        } catch {
          setUser(null);
        }
      }
      setLoadingAuth(false);
    };
    init();
  }, []);

  // Exponemos user y un flag isAuthenticated
  const isAuthenticated = Boolean(user);

  // Mientras cargamos perfil inicial, devolvemos un spinner
  if (loadingAuth) {
    return <div className="loading-spinner">Verificando sesión…</div>;
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, logout, fetchWithAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
};
