import React from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/auth-context";
import { useScrollReveal } from "../hooks/useScrollReveal";
import "../styles/perfil.css";

function userInitials(user) {
  if (!user) {
    return "MF";
  }

  const base = (user.nombre || user.username || "Mascota Feliz").trim();
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function roleLabel(rol) {
  if (rol === "admin") return "Administrador";
  if (rol === "veterinario") return "Veterinario";
  if (rol === "cliente") return "Tutor";
  return rol || "-";
}

export default function Perfil() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useScrollReveal(".perfil-page .reveal-on-scroll", String(Boolean(user)));

  if (!user) {
    return <div className="loading-spinner">Cargando perfil...</div>;
  }

  return (
    <section className="perfil-page">
      <article className="perfil-hero page-shell reveal-on-scroll">
        <div className="perfil-avatar" aria-hidden="true">
          {userInitials(user)}
        </div>
        <div className="perfil-hero-copy">
          <p>Cuenta activa</p>
          <h1>{user.nombre || user.username}</h1>
          <span>{roleLabel(user.rol)}</span>
        </div>
        <div className="perfil-hero-actions">
          <button type="button" className="btn-primary" onClick={() => navigate("/reservar")}>
            Reservar consulta
          </button>
          <button type="button" className="btn-ghost" onClick={() => navigate("/farmacia")}>
            Ir a farmacia
          </button>
        </div>
      </article>

      <article className="perfil-details page-shell reveal-on-scroll" data-delay="1">
        <h2>Datos de contacto</h2>
        <dl className="perfil-grid">
          <div>
            <dt>Usuario</dt>
            <dd>{user.username}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user.email || "-"}</dd>
          </div>
          <div>
            <dt>Telefono</dt>
            <dd>{user.telefono || "-"}</dd>
          </div>
          <div>
            <dt>RUT</dt>
            <dd>{user.rut || "-"}</dd>
          </div>
          <div className="full">
            <dt>Direccion</dt>
            <dd>{user.direccion || "-"}</dd>
          </div>
        </dl>
      </article>

      <article className="perfil-trust page-shell reveal-on-scroll" data-delay="2">
        <h3>Tu espacio en Mascota Feliz</h3>
        <ul>
          <li>Agenda citas presenciales o moviles en pocos pasos.</li>
          <li>Gestiona compras de farmacia y seguimiento de ordenes.</li>
          <li>Accede a confirmaciones de pago en un flujo simple.</li>
        </ul>
        <div className="perfil-actions">
          <button type="button" className="btn-ghost" onClick={() => navigate("/")}>
            Volver al inicio
          </button>
          <button type="button" className="btn-secondary" onClick={logout}>
            Cerrar sesion
          </button>
        </div>
      </article>
    </section>
  );
}
