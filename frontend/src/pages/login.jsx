// src/pages/login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import '../styles/login.css';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = 'Debes ingresar tu usuario.';
    if (!form.password) errs.password = 'Debes ingresar tu contraseña.';
    return errs;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    console.log('🔐 Intentando login con:', form);
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) {
      console.log('❌ Errores de validación local:', fieldErrors);
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    try {
      await login(form.username, form.password);
      console.log('✅ Login exitoso, navegando a /');
      navigate('/');
    } catch (err) {
      console.error('🚨 Error en login:', err);
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
      console.log('⏹️ handleSubmit finalizado, loading=false');
    }
  };

  return (
    <div className="login-bg">
      <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
        <h2>Iniciar Sesión</h2>

        <div className="input-group">
          <label htmlFor="username">Usuario</label>
          <input
            type="text"
            name="username"
            id="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Tu nombre de usuario"
            autoFocus
            className={errors.username ? 'error-input' : ''}
          />
          {errors.username && <div className="error-msg">{errors.username}</div>}
        </div>

        <div className="input-group">
          <label htmlFor="password">Contraseña</label>
          <div className="input-eye-container">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Tu contraseña"
              autoComplete="current-password"
              className={errors.password ? 'error-input' : ''}
            />
            <span
              className="eye-icon"
              tabIndex={0}
              onClick={() => setShowPassword(v => !v)}
            >
              {/* SVG icon */}👁️
            </span>
          </div>
          {errors.password && <div className="error-msg">{errors.password}</div>}
        </div>

        {errors.form && <div className="error-msg form-error">{errors.form}</div>}

        <button className="login-btn" type="submit" disabled={loading}>
          {loading ? 'Ingresando...' : 'Entrar'}
        </button>

        <div className="register-link">
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </div>
      </form>
    </div>
  );
}
