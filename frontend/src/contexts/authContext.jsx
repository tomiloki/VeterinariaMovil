import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "./auth-context";
import { apiRequest, extractApiError } from "../services/api";

const ACCESS_KEY = "access";
const REFRESH_KEY = "refresh";

function getStoredToken(key) {
  return localStorage.getItem(key) || sessionStorage.getItem(key);
}

function clearStoredTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
}

function persistTokens(access, refresh, rememberSession) {
  clearStoredTokens();
  const targetStorage = rememberSession ? localStorage : sessionStorage;
  targetStorage.setItem(ACCESS_KEY, access);
  targetStorage.setItem(REFRESH_KEY, refresh);
}

function persistAccessToken(access) {
  if (localStorage.getItem(REFRESH_KEY)) {
    localStorage.setItem(ACCESS_KEY, access);
    return;
  }
  if (sessionStorage.getItem(REFRESH_KEY)) {
    sessionStorage.setItem(ACCESS_KEY, access);
    return;
  }
  localStorage.setItem(ACCESS_KEY, access);
}

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const logout = () => {
    clearStoredTokens();
    setUser(null);
    navigate("/login");
  };

  const fetchProfile = async (accessToken) => {
    const response = await apiRequest("/perfil/", {
      token: accessToken,
    });
    if (!response.ok) {
      throw new Error(extractApiError(response.data, "No se pudo cargar el perfil."));
    }
    return response.data;
  };

  const login = async (username, password, rememberSession = true) => {
    const tokenResponse = await apiRequest("/token/", {
      method: "POST",
      body: { username, password },
    });

    if (!tokenResponse.ok) {
      throw new Error(extractApiError(tokenResponse.data, "Error al iniciar sesion."));
    }

    persistTokens(tokenResponse.data.access, tokenResponse.data.refresh, rememberSession);

    const profile = await fetchProfile(tokenResponse.data.access);
    setUser(profile);
    navigate("/");
  };

  const fetchWithAuth = async (path, options = {}) => {
    let access = getStoredToken(ACCESS_KEY);
    const refresh = getStoredToken(REFRESH_KEY);

    if (!access) {
      throw new Error("Sesion expirada. Por favor inicia sesion de nuevo.");
    }

    let response = await apiRequest(path, {
      ...options,
      token: access,
    });

    if (response.status === 401 && refresh) {
      const refreshResponse = await apiRequest("/token/refresh/", {
        method: "POST",
        body: { refresh },
      });

      if (!refreshResponse.ok || !refreshResponse.data?.access) {
        logout();
        throw new Error("Sesion expirada. Por favor inicia sesion de nuevo.");
      }

      access = refreshResponse.data.access;
      persistAccessToken(access);

      response = await apiRequest(path, {
        ...options,
        token: access,
      });
    }

    if (!response.ok) {
      throw new Error(extractApiError(response.data, "Error en la peticion."));
    }

    return { status: response.status, data: response.data };
  };

  useEffect(() => {
    const init = async () => {
      const access = getStoredToken(ACCESS_KEY);
      if (!access) {
        setLoadingAuth(false);
        return;
      }

      try {
        const profile = await fetchProfile(access);
        setUser(profile);
      } catch {
        clearStoredTokens();
        setUser(null);
      } finally {
        setLoadingAuth(false);
      }
    };

    init();
  }, []);

  if (loadingAuth) {
    return <div className="loading-spinner">Verificando sesion...</div>;
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: Boolean(user), loadingAuth, login, logout, fetchWithAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};
