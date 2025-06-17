import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/register.css';

const fieldNames = {
username: 'Usuario',
password: 'Contraseña',
confirmPassword: 'Confirmar Contraseña',
nombre: 'Nombre',
rut: 'RUT',
correo: 'Correo',
telefono: 'Teléfono',
direccion: 'Dirección',
};

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    rut: '',
    correo: '',
    telefono: '',
    direccion: ''
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showHint, setShowHint] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validaciones específicas de cada campo
  const fieldHints = {
    username: 'Solo letras y números, sin espacios.',
    password: 'Mínimo 8 caracteres. Debe contener mayúscula, minúscula y número.',
    confirmPassword: 'Debe coincidir con la contraseña.',
    nombre: 'Nombre completo. Ejemplo: Juan Pérez',
    rut: 'Sin puntos y con guion (ej: 12345678-9)',
    correo: 'Debe ser un correo válido.',
    telefono: 'Solo números, mínimo 8 dígitos.',
    direccion: 'Dirección de residencia completa.',
  };

  const validate = () => {
    const e = {};
    if (!form.username) e.username = 'El usuario es obligatorio.';
    else if (!/^[a-zA-Z0-9]{4,}$/.test(form.username)) e.username = 'Solo letras y números, mínimo 4 caracteres.';

    if (!form.password) e.password = 'La contraseña es obligatoria.';
    else if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/.test(form.password))
      e.password = 'Mínimo 8 caracteres, con mayúscula, minúscula y número.';

    if (!form.confirmPassword) e.confirmPassword = 'Debes confirmar la contraseña.';
    else if (form.confirmPassword !== form.password) e.confirmPassword = 'Las contraseñas no coinciden.';

    if (!form.nombre) e.nombre = 'El nombre es obligatorio.';
    else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.nombre)) e.nombre = 'Solo letras y espacios.';

    if (!form.rut) e.rut = 'El RUT es obligatorio.';
    else if (!/^[0-9]{7,8}-[0-9Kk]$/.test(form.rut)) e.rut = 'Formato incorrecto. Ejemplo: 12345678-9';

    if (!form.correo) e.correo = 'El correo es obligatorio.';
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.correo)) e.correo = 'Correo inválido.';

    if (!form.telefono) e.telefono = 'El teléfono es obligatorio.';
    else if (!/^\d{8,}$/.test(form.telefono)) e.telefono = 'Solo números, mínimo 8 dígitos.';

    if (!form.direccion) e.direccion = 'La dirección es obligatoria.';

    return e;
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setServerError('');
  };

  const handleBlur = e => {
    setTouched({ ...touched, [e.target.name]: true });
    setErrors(validate());
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    setTouched({
      username: true, password: true, confirmPassword: true,
      nombre: true, rut: true, correo: true, telefono: true, direccion: true
    });

    if (Object.keys(newErrors).length > 0) {
      console.log("NO SE ENVÍA. Errores:", newErrors, form);
      return;
    }
    console.log("SE ENVÍA:", form);

    setLoading(true);
    try {
      const { username, password, nombre, rut, correo, telefono, direccion } = form;
      const userToSend = { username, password, nombre, rut, correo, telefono, direccion, rol: 'cliente' };

      const res = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userToSend)
      });
      if (res.ok) {
        setServerError('');
        navigate('/login');
      } else {
        const data = await res.json();
        if (data && typeof data === 'object') {
          // Si es error por campo, lo mostramos en su input
          let fieldErrs = {};
          Object.entries(data).forEach(([field, msgs]) => {
            fieldErrs[field] = Array.isArray(msgs) ? msgs.join(', ') : msgs;
          });
          setErrors(fieldErrs);
          setServerError('Corrige los campos marcados en rojo');
        } else {
          setServerError(data.detail || 'No se pudo registrar el usuario.');
        }
      }
    } catch {
      setServerError('No se pudo conectar al servidor.');
    }
    setLoading(false);
  };

  return (
    <div className="register-bg">
      <form className="register-form" onSubmit={handleSubmit} autoComplete="off">
        <h2>Crear Cuenta</h2>
        {Object.keys(form).map((key, idx) => {
          // No muestres el campo "rol"
          if (key === 'rol') return null;
          let inputType = 'text';
          if (key === 'password') inputType = showPassword ? 'text' : 'password';
          else if (key === 'confirmPassword') inputType = showConfirmPassword ? 'text' : 'password';
          else if (key === 'correo') inputType = 'email';
          else if (key === 'telefono') inputType = 'tel';

          return (
            <div className="input-group" key={key}>
              <label htmlFor={key} className="label-row">
                <span className="label-text">{fieldNames[key] || (key.charAt(0).toUpperCase() + key.slice(1))}</span>
                {/* Tooltip funcional */}
                <span
                  className="hint-container"
                  tabIndex={0}
                  onMouseEnter={() => setShowHint(key)}
                  onMouseLeave={() => setShowHint('')}
                  onFocus={() => setShowHint(key)}
                  onBlur={() => setShowHint('')}
                >
                  <span className="hint-icon">?</span>
                  {showHint === key && (
                    <span className="hint-tooltip">{fieldHints[key]}</span>
                  )}
                </span>
              </label>
              {/* Si es password, muestra con ojito */}
              {(key === 'password' || key === 'confirmPassword') ? (
                <div className="input-eye-container">
                  <input
                    id={key}
                    name={key}
                    type={inputType}
                    placeholder={fieldHints[key]}
                    className={errors[key] && touched[key] ? 'error-input' : ''}
                    value={form[key]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="off"
                  />
                  <span
                    className="eye-icon"
                    tabIndex={0}
                    onClick={() =>
                      key === 'password'
                        ? setShowPassword((v) => !v)
                        : setShowConfirmPassword((v) => !v)
                    }
                  >
                    {/* Minimalista SVG */}
                    <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                      <ellipse cx="10" cy="10" rx="8" ry="4" stroke="#888" strokeWidth="1.7" fill="none"/>
                      <circle cx="10" cy="10" r="1.6" fill="#888" />
                      {((key === 'password' && showPassword) || (key === 'confirmPassword' && showConfirmPassword)) ? (
                        <line x1="5" y1="15" x2="15" y2="5" stroke="#888" strokeWidth="1.6" />
                      ) : null}
                    </svg>
                  </span>
                </div>
              ) : (
                <input
                  id={key}
                  name={key}
                  type={inputType}
                  placeholder={fieldHints[key]}
                  className={errors[key] && touched[key] ? 'error-input' : ''}
                  value={form[key]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="off"
                />
              )}
            </div>
          );
        })}
        {serverError && <div className="error-msg">{serverError}</div>}
        <button className="register-btn" type="submit" disabled={loading}>
          {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </button>
        <div className="login-link">
          ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
        </div>
      </form>
    </div>
  );
}