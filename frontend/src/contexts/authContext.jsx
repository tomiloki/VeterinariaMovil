// frontend/src/contexts/authContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // Al montar o cambiar token, validamos al usuario
  useEffect(() => {
    console.log('🔐 [Auth] token has changed:', token);
    if (!token) {
      console.log('🔐 [Auth] no hay token, marcando loading=false');
      setLoading(false);
      return;
    }

    console.log('🔐 [Auth] enviando GET miusuario con header Authorization:', `Bearer ${token}`);
    api.get('miusuario/', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      console.log('🔐 [Auth] /miusuario/ OK, usuario:', res.data);
      setUser(res.data);
    })
    .catch(err => {
      console.error('🔐 [Auth] /miusuario/ FAILED:', err.response?.status, err.response?.data || err.message);
      setUser(null);
      setToken('');
      localStorage.removeItem('token');
    })
    .finally(() => {
      console.log('🔐 [Auth] loading = false');
      setLoading(false);
    });
  }, [token]);

  const login = async (username, password) => {
    const res = await api.post('login/', { username, password });
    localStorage.setItem('token', res.data.access);
    setToken(res.data.access);
    // user se rellenará en el useEffect
  };

  const register = async (data) => {
    await api.post('register/', data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}