// src/pages/register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/register.css';

const fieldNames = {
  username: 'Usuario',
  password: 'Contraseña',
  confirmPassword: 'Confirmar Contraseña',
  nombre: 'Nombre',
  rut: 'RUT',
  email: 'Correo Electrónico',
  telefono: 'Teléfono',
  direccion: 'Dirección',
};
const fieldHints = {
  username: 'Solo letras y números, sin espacios.',
  password: 'Mínimo 8 caracteres. Debe contener mayúscula, minúscula y número.',
  confirmPassword: 'Debe coincidir con la contraseña.',
  nombre: 'Nombre completo. Ejemplo: Juan Pérez',
  rut: 'Sin puntos y con guion (ej: 12345678-9)',
  email: 'Debe ser un correo válido.',
  telefono: 'Solo números, mínimo 8 dígitos.',
  direccion: 'Dirección de residencia completa.',
};

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    rut: '',
    email: '',
    telefono: '',
    direccion: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.username) e.username = 'El usuario es obligatorio.';
    else if (!/^[a-zA-Z0-9]{4,}$/.test(form.username))
      e.username = 'Solo letras y números, mínimo 4 caracteres.';
    if (!form.password) e.password = 'La contraseña es obligatoria.';
    else if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/.test(form.password))
      e.password = 'Mínimo 8 caracteres, con mayúscula, minúscula y número.';
    if (!form.confirmPassword) e.confirmPassword = 'Debes confirmar la contraseña.';
    else if (form.confirmPassword !== form.password)
      e.confirmPassword = 'Las contraseñas no coinciden.';
    if (!form.nombre) e.nombre = 'El nombre es obligatorio.';
    if (!form.rut) e.rut = 'El RUT es obligatorio.';
    if (!form.email) e.email = 'El correo es obligatorio.';
    if (!form.telefono) e.telefono = 'El teléfono es obligatorio.';
    if (!form.direccion) e.direccion = 'La dirección es obligatoria.';
    return e;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const handleBlur = e => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(validate());
  };

  const handleSubmit = async e => {
    e.preventDefault();
    console.log('📝 Intentando registro con:', form);
    const newErrors = validate();
    setErrors(newErrors);
    setTouched({
      username: true, password: true, confirmPassword: true,
      nombre: true, rut: true, email: true, telefono: true, direccion: true,
    });
    if (Object.keys(newErrors).length) {
      console.log('❌ Errores de validación local en register:', newErrors);
      return;
    }

    setLoading(true);
    setServerError('');
    try {
      const payload = {
        username: form.username,
        password: form.password,
        nombre: form.nombre,
        rut: form.rut,
        email: form.email,
        telefono: form.telefono,
        direccion: form.direccion,
      };
      console.log('📤 Enviando payload de registro:', payload);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/registro/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      console.log('📥 Estado de respuesta register:', res.status);

      const data = await res.json();
      console.log('📄 Datos de respuesta register:', data);

      if (res.ok) {
        console.log('✅ Registro exitoso, navegando a /login');
        navigate('/login');
      } else if (data && typeof data === 'object') {
        const fieldErrs = {};
        Object.entries(data).forEach(([field, msgs]) => {
          fieldErrs[field] = Array.isArray(msgs) ? msgs.join(', ') : msgs;
        });
        console.error('🚨 Errores del servidor en register:', fieldErrs);
        setErrors(fieldErrs);
        setServerError('Corrige los campos marcados en rojo.');
      } else {
        console.error('🚨 Error genérico de registro:', data);
        setServerError(data.detail || 'No se pudo registrar el usuario.');
      }
    } catch (err) {
      console.error('🔥 Excepción al conectar con el servidor:', err);
      setServerError('No se pudo conectar al servidor.');
    } finally {
      setLoading(false);
      console.log('⏹️ handleSubmit register finalizado, loading=false');
    }
  };

  return (
    <div className="register-bg">
      <form className="register-form" onSubmit={handleSubmit} noValidate>
        <h2>Crear Cuenta</h2>
        {['username','password','confirmPassword','nombre','rut','email','telefono','direccion'].map(key => (
          <div className="input-group" key={key}>
            <label htmlFor={key}>{fieldNames[key]}</label>
            <input
              id={key}
              name={key}
              type={
                key.includes('password')
                  ? key === 'password'
                    ? showPassword ? 'text' : 'password'
                    : showConfirmPassword ? 'text' : 'password'
                  : key === 'email'
                  ? 'email'
                  : key === 'telefono'
                  ? 'tel'
                  : 'text'
              }
              placeholder={fieldHints[key]}
              className={errors[key] && touched[key] ? 'error-input' : ''}
              value={form[key]}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="off"
            />
            {touched[key] && errors[key] && <div className="error-msg">{errors[key]}</div>}
          </div>
        ))}
        {serverError && <div className="error-msg form-error">{serverError}</div>}
        <button className="register-btn" type="submit" disabled={loading}>
          {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </button>
        <div className="login-link">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </div>
      </form>
    </div>
  );
}
