import React from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../contexts/auth-context";

export default function PrivateRoute({ roles = [], children }) {
  const { user, loadingAuth } = useAuth();

  if (loadingAuth) {
    return <div className="loading-spinner">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
