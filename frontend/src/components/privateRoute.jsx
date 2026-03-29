// src/components/privateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';

export default function PrivateRoute({ roles = [], children }) {
  const { user, loadingAuth } = useAuth();

  // Mostrar spinner mientras se verifica la sesión
  if (loadingAuth) {
    return <div className="loading-spinner">Cargando...</div>;
  }

  // Si no hay usuario, redirigimos al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si hay roles definidos y el usuario no tiene permiso, redirigimos al home
  if (roles.length > 0 && !roles.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }

  // Finalmente, renderizamos el contenido envuelto
  return <>{children}</>;
}
