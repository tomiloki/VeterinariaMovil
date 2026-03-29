import React, { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../contexts/auth-context";
import { BRAND_IMAGES } from "../data/imageLibrary";
import "../styles/login.css";

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [pendingCredentials, setPendingCredentials] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", form: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.username.trim()) {
      nextErrors.username = "Debes ingresar tu usuario.";
    }
    if (!form.password) {
      nextErrors.password = "Debes ingresar tu contrasena.";
    }
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setPendingCredentials({
      username: form.username.trim(),
      password: form.password,
    });
    setShowSessionModal(true);
  };

  const handleSessionChoice = async (rememberSession) => {
    if (!pendingCredentials) {
      setShowSessionModal(false);
      return;
    }

    setLoading(true);
    try {
      await login(
        pendingCredentials.username,
        pendingCredentials.password,
        rememberSession
      );
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setLoading(false);
      setShowSessionModal(false);
      setPendingCredentials(null);
    }
  };

  const closeSessionModal = () => {
    if (loading) {
      return;
    }
    setShowSessionModal(false);
    setPendingCredentials(null);
  };

  return (
    <section className="auth-page">
      <article className="auth-showcase">
        <img src={BRAND_IMAGES.services.consulta} alt="Veterinaria atendiendo consulta preventiva" />
        <div className="auth-showcase-overlay" />
        <div className="auth-showcase-copy">
          <p>Portal de tutores</p>
          <h1>Gestiona citas, pagos y farmacia desde un solo lugar.</h1>
          <ul>
            <li>Agenda consultas en segundos.</li>
            <li>Sigue el historial de atenciones.</li>
            <li>Compra con Webpay de forma segura.</li>
          </ul>
        </div>
      </article>

      <form className="auth-form" onSubmit={handleSubmit} autoComplete="on">
        <div className="auth-head">
          <h2>Iniciar sesion</h2>
          <p>Ingresa para continuar con tu plan de cuidado veterinario.</p>
        </div>

        <div className="input-group">
          <label htmlFor="username">Usuario</label>
          <input
            id="username"
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            placeholder="Tu nombre de usuario"
            autoFocus
            autoComplete="username"
            className={errors.username ? "error-input" : ""}
          />
          {errors.username && <div className="error-msg">{errors.username}</div>}
        </div>

        <div className="input-group">
          <label htmlFor="password">Contrasena</label>
          <div className="input-eye-container">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder="Tu contrasena"
              autoComplete="current-password"
              className={errors.password ? "error-input" : ""}
            />
            <button
              type="button"
              className="eye-icon"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
            >
              {showPassword ? "Oc" : "Ver"}
            </button>
          </div>
          {errors.password && <div className="error-msg">{errors.password}</div>}
        </div>

        {errors.form && <div className="error-msg form-error">{errors.form}</div>}
        <p className="session-hint">
          Te mostraremos una ventana para elegir si deseas mantener la sesion iniciada.
        </p>

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Entrar"}
        </button>

        <div className="auth-link">
          No tienes cuenta? <Link to="/register">Crear cuenta</Link>
        </div>
      </form>

      {showSessionModal && (
        <div className="session-modal-backdrop" role="presentation" onClick={closeSessionModal}>
          <section
            className="session-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="session-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="session-modal-header">
              <h3 id="session-modal-title">Mantener sesion iniciada?</h3>
              <p>Elige como quieres iniciar sesion en este dispositivo.</p>
            </header>

            <div className="session-modal-options">
              <button
                type="button"
                className="session-modal-action primary"
                disabled={loading}
                onClick={() => handleSessionChoice(true)}
              >
                Si, recordarme
                <small>No te pedira login al cerrar y abrir el navegador.</small>
              </button>

              <button
                type="button"
                className="session-modal-action secondary"
                disabled={loading}
                onClick={() => handleSessionChoice(false)}
              >
                Solo esta sesion
                <small>Se cerrara sesion cuando cierres el navegador.</small>
              </button>
            </div>

            <button
              type="button"
              className="session-modal-cancel"
              disabled={loading}
              onClick={closeSessionModal}
            >
              Volver
            </button>
          </section>
        </div>
      )}
    </section>
  );
}
