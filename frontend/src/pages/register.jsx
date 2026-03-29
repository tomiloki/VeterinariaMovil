import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { BRAND_IMAGES } from "../data/imageLibrary";
import { apiRequest, extractApiError } from "../services/api";
import "../styles/register.css";

const fieldNames = {
  username: "Usuario",
  password: "Contrasena",
  confirmPassword: "Confirmar contrasena",
  nombre: "Nombre",
  rut: "RUT",
  email: "Correo electronico",
  telefono: "Telefono",
  direccion: "Direccion",
};

const fieldHints = {
  username: "Solo letras y numeros, sin espacios.",
  password: "Minimo 8 caracteres con mayuscula, minuscula y numero.",
  confirmPassword: "Debe coincidir con la contrasena.",
  nombre: "Nombre completo del tutor.",
  rut: "Sin puntos y con guion. Ej: 12345678-9",
  email: "Debe ser un correo valido.",
  telefono: "Solo numeros, minimo 8 digitos.",
  direccion: "Direccion de residencia.",
};

const fieldAutocomplete = {
  username: "username",
  password: "new-password",
  confirmPassword: "new-password",
  nombre: "name",
  rut: "off",
  email: "email",
  telefono: "tel",
  direccion: "street-address",
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    rut: "",
    email: "",
    telefono: "",
    direccion: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = () => {
    const nextErrors = {};
    if (!form.username || !/^[a-zA-Z0-9]{4,}$/.test(form.username)) {
      nextErrors.username = "Solo letras y numeros, minimo 4 caracteres.";
    }
    if (!form.password || !/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/.test(form.password)) {
      nextErrors.password = "Minimo 8 caracteres, con mayuscula, minuscula y numero.";
    }
    if (!form.confirmPassword || form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Las contrasenas no coinciden.";
    }
    if (!form.nombre) nextErrors.nombre = "El nombre es obligatorio.";
    if (!form.rut) nextErrors.rut = "El RUT es obligatorio.";
    if (!form.email) nextErrors.email = "El correo es obligatorio.";
    if (!form.telefono) nextErrors.telefono = "El telefono es obligatorio.";
    if (!form.direccion) nextErrors.direccion = "La direccion es obligatoria.";
    return nextErrors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validate());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    setTouched({
      username: true,
      password: true,
      confirmPassword: true,
      nombre: true,
      rut: true,
      email: true,
      telefono: true,
      direccion: true,
    });

    if (Object.keys(validationErrors).length) {
      return;
    }

    setLoading(true);
    setServerError("");

    const response = await apiRequest("/registro/", {
      method: "POST",
      body: {
        username: form.username,
        password: form.password,
        nombre: form.nombre,
        rut: form.rut,
        email: form.email,
        telefono: form.telefono,
        direccion: form.direccion,
      },
    });

    if (response.ok) {
      setLoading(false);
      navigate("/login");
      return;
    }

    if (response.data && typeof response.data === "object") {
      const nextErrors = {};
      Object.entries(response.data).forEach(([field, messages]) => {
        nextErrors[field] = Array.isArray(messages) ? messages.join(", ") : messages;
      });
      setErrors(nextErrors);
      setServerError("Corrige los campos marcados.");
    } else {
      setServerError(extractApiError(response.data, "No se pudo registrar el usuario."));
    }

    setLoading(false);
  };

  return (
    <section className="register-page">
      <article className="register-showcase">
        <img src={BRAND_IMAGES.services.movil} alt="Equipo veterinario en visita domiciliaria" />
        <div className="register-showcase-overlay" />
        <div className="register-showcase-copy">
          <p>Nueva cuenta</p>
          <h1>Empieza a cuidar a tu mascota con una experiencia clinica mas simple.</h1>
          <ul>
            <li>Reserva online en modalidad presencial o movil.</li>
            <li>Historial centralizado de atenciones y tratamientos.</li>
            <li>Farmacia integrada con seguimiento de pedidos.</li>
          </ul>
        </div>
      </article>

      <form className="register-form" onSubmit={handleSubmit} noValidate autoComplete="on">
        <div className="register-head">
          <h2>Crear cuenta</h2>
          <p>Completa tus datos para agendar consultas y comprar en farmacia.</p>
        </div>

        <div className="register-grid">
          {["username", "password", "confirmPassword", "nombre", "rut", "email", "telefono", "direccion"].map((key) => (
            <div className={`input-group ${key === "direccion" ? "full-width" : ""}`} key={key}>
              <label htmlFor={key}>{fieldNames[key]}</label>
              <div className={key.includes("password") ? "input-eye-container" : ""}>
                <input
                  id={key}
                  name={key}
                  type={
                    key === "password"
                      ? showPassword
                        ? "text"
                        : "password"
                      : key === "confirmPassword"
                        ? showConfirmPassword
                          ? "text"
                          : "password"
                        : key === "email"
                          ? "email"
                          : "text"
                  }
                  placeholder={fieldHints[key]}
                  className={errors[key] && touched[key] ? "error-input" : ""}
                  value={form[key]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete={fieldAutocomplete[key]}
                />
                {key === "password" && (
                  <button
                    type="button"
                    className="eye-icon"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                  >
                    {showPassword ? "Oc" : "Ver"}
                  </button>
                )}
                {key === "confirmPassword" && (
                  <button
                    type="button"
                    className="eye-icon"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    aria-label={showConfirmPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                  >
                    {showConfirmPassword ? "Oc" : "Ver"}
                  </button>
                )}
              </div>
              {touched[key] && errors[key] && <div className="error-msg">{errors[key]}</div>}
            </div>
          ))}
        </div>

        {serverError && <div className="error-msg form-error">{serverError}</div>}

        <button className="register-submit" type="submit" disabled={loading}>
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>

        <div className="login-link">
          Ya tienes cuenta? <Link to="/login">Iniciar sesion</Link>
        </div>
      </form>
    </section>
  );
}
