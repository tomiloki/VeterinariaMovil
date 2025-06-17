import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import '../styles/login.css'; // Asegúrate de tenerlo

export default function Login() {
  const { login } = useAuth(); //
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleBlur = e => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const validate = () => {
    let msg = '';
    if (!form.username) msg = 'Debes ingresar tu usuario.';
    else if (!form.password) msg = 'Debes ingresar tu contraseña.';
    return msg;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const msg = validate();
    if (msg) return setError(msg);
    setLoading(true);
    try {
      await login(form.username, form.password);
      setError('');
      navigate('/');
    } catch (err) {
      setError('No se pudo conectar al servidor.');
    }
    setLoading(false);
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
            onBlur={handleBlur}
            className={!form.username && touched.username ? 'error-input' : ''}
            placeholder="Tu nombre de usuario"
            autoFocus
          />
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
              onBlur={handleBlur}
              className={!form.password && touched.password ? 'error-input' : ''}
              placeholder="Tu contraseña"
              autoComplete="current-password"
            />
            <span
              className="eye-icon"
              tabIndex={0}
              onClick={() => setShowPassword(v => !v)}
            >
              {/* Minimalista SVG */}
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                <ellipse cx="10" cy="10" rx="8" ry="4" stroke="#888" strokeWidth="1.7" fill="none"/>
                <circle cx="10" cy="10" r="1.6" fill="#888" />
                {showPassword ? (
                  <line x1="5" y1="15" x2="15" y2="5" stroke="#888" strokeWidth="1.6" />
                ) : null}
              </svg>
            </span>
          </div>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <button className="login-btn" type="submit" disabled={loading}>
          {loading ? 'Ingresando...' : 'Entrar'}
        </button>

        <div className="register-link">
          ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
        </div>
      </form>
    </div>
  );
}