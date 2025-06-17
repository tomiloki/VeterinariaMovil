// frontend/src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';

export default function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();

  // Mientras auth se inicializa, no mostramos nada
  if (loading) return null;

  // Si no hay user → login
  if (!user) return <Navigate to="/login" replace />;

  // Si roles definidos y el rol del user no está permitido → home
  if (roles && !roles.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }

  // OK, renderizamos la ruta protegida
  return children;
}