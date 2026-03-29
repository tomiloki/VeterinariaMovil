import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/auth-context";
import { BRAND_IMAGES } from "../data/imageLibrary";
import "../styles/reservaCitaForm.css";

const OPCIONES_SUBSERVICIO = [
  { value: "revision", label: "Revision clinica" },
  { value: "aseo", label: "Arreglos y aseo" },
  { value: "quirurgico", label: "Intervenciones quirurgicas" },
];

export default function ReservaCitaForm() {
  const { user, fetchWithAuth, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const [tipoCita, setTipoCita] = useState(query.get("tipo") === "movil" ? "movil" : "presencial");
  const [subservicio, setSubservicio] = useState("revision");
  const [petNombre, setPetNombre] = useState("");
  const [petEspecie, setPetEspecie] = useState("");
  const [petRaza, setPetRaza] = useState("");
  const [petEdad, setPetEdad] = useState("");
  const [petPeso, setPetPeso] = useState("");
  const [fecha, setFecha] = useState("");
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const labels = {
    revision: "Revision clinica",
    aseo: "Arreglos y aseo",
    quirurgico: "Intervenciones quirurgicas",
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!subservicio) return setError("Selecciona un servicio.");
    if (!petNombre || !petEspecie) return setError("Ingresa nombre y especie de la mascota.");
    if (petEspecie === "perro" && !petRaza) return setError("Indica la raza de tu perro.");
    if (!petEdad) return setError("Ingresa la edad de la mascota.");
    if (!petPeso) return setError("Ingresa el peso de la mascota.");
    if (!fecha) return setError("Debes escoger fecha y hora.");

    setError("");
    setLoading(true);

    try {
      const { data: mascota } = await fetchWithAuth("/mascotas/", {
        method: "POST",
        body: {
          nombre: petNombre,
          especie: petEspecie,
          raza: petEspecie === "perro" ? petRaza : "",
          edad: Number(petEdad),
          peso: Number(petPeso),
        },
      });

      const { data: cita } = await fetchWithAuth("/citas/", {
        method: "POST",
        body: {
          fecha,
          tipo: tipoCita,
          subservicio,
          mascota: mascota.id,
          motivo,
          ...(tipoCita === "movil" && { direccion: user.direccion }),
        },
      });

      navigate("/reservar/exito", {
        state: {
          citaId: cita.id,
          subservicio,
          tipo: tipoCita,
          mascota: mascota.nombre,
          fecha,
          motivo,
          ...(tipoCita === "movil" && { direccion: user.direccion }),
        },
      });
    } catch (requestError) {
      if (requestError.message.includes("Sesion expirada")) {
        logout();
        return;
      }
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="reserva-page">
      <article className="reserva-hero">
        <img src={BRAND_IMAGES.services.consulta} alt="Consulta veterinaria con tutora y mascota" />
        <div className="reserva-hero-overlay" />
        <div className="reserva-hero-copy">
          <p>Agenda inteligente</p>
          <h1>Reserva una consulta en minutos.</h1>
          <ul>
            <li>Modalidad presencial o movil.</li>
            <li>Flujo conectado con pago Webpay.</li>
            <li>Resumen final antes de confirmar.</li>
          </ul>
        </div>
      </article>

      <form className="reserva-form" onSubmit={handleSubmit} noValidate>
        <div className="reserva-head">
          <h2>Datos de la consulta</h2>
          <p>Completa la informacion clinica de tu mascota para agendar correctamente.</p>
        </div>

        <div className="reserva-layout">
          <div className="reserva-fields">
            <div className="field-group tipo-group">
              <label>Tipo de cita</label>
              <div className="tipo-options">
                <label className={tipoCita === "presencial" ? "active" : ""}>
                  <input
                    type="radio"
                    value="presencial"
                    checked={tipoCita === "presencial"}
                    onChange={() => setTipoCita("presencial")}
                  />
                  Presencial
                </label>
                <label className={tipoCita === "movil" ? "active" : ""}>
                  <input type="radio" value="movil" checked={tipoCita === "movil"} onChange={() => setTipoCita("movil")} />
                  Movil
                </label>
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="subservicio">Servicio</label>
              <select id="subservicio" value={subservicio} onChange={(event) => setSubservicio(event.target.value)}>
                {OPCIONES_SUBSERVICIO.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="petNombre">Nombre mascota</label>
                <input
                  id="petNombre"
                  type="text"
                  value={petNombre}
                  onChange={(event) => setPetNombre(event.target.value)}
                  placeholder="Ej: Rocky"
                />
              </div>

              <div className="field-group">
                <label htmlFor="petEspecie">Especie</label>
                <select id="petEspecie" value={petEspecie} onChange={(event) => setPetEspecie(event.target.value)}>
                  <option value="">Seleccionar</option>
                  <option value="perro">Perro</option>
                  <option value="gato">Gato</option>
                </select>
              </div>
            </div>

            {petEspecie === "perro" && (
              <div className="field-group">
                <label htmlFor="petRaza">Raza</label>
                <input
                  id="petRaza"
                  type="text"
                  value={petRaza}
                  onChange={(event) => setPetRaza(event.target.value)}
                  placeholder="Ej: Chihuahua"
                />
              </div>
            )}

            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="petEdad">Edad (anos)</label>
                <input
                  id="petEdad"
                  type="number"
                  min="0"
                  value={petEdad}
                  onChange={(event) => setPetEdad(event.target.value)}
                  placeholder="Ej: 3"
                />
              </div>

              <div className="field-group">
                <label htmlFor="petPeso">Peso (kg)</label>
                <input
                  id="petPeso"
                  type="number"
                  min="0"
                  step="0.1"
                  value={petPeso}
                  onChange={(event) => setPetPeso(event.target.value)}
                  placeholder="Ej: 4.5"
                />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="fecha">Fecha y hora</label>
              <input id="fecha" type="datetime-local" value={fecha} onChange={(event) => setFecha(event.target.value)} />
            </div>

            <div className="field-group">
              <label htmlFor="motivo">Motivo de consulta</label>
              <textarea
                id="motivo"
                rows="4"
                value={motivo}
                onChange={(event) => setMotivo(event.target.value)}
                placeholder="Describe sintomas, antecedentes o necesidad de atencion."
              />
            </div>
          </div>

          <aside className="detail-group">
            <h3>Resumen de reserva</h3>
            <ul>
              <li>
                <strong>Tipo:</strong> {tipoCita === "movil" ? "Movil" : "Presencial"}
              </li>
              <li>
                <strong>Servicio:</strong> {labels[subservicio] || "-"}
              </li>
              <li>
                <strong>Mascota:</strong> {petNombre || "-"}
              </li>
              <li>
                <strong>Especie:</strong> {petEspecie || "-"}
              </li>
              {petEspecie === "perro" && (
                <li>
                  <strong>Raza:</strong> {petRaza || "-"}
                </li>
              )}
              <li>
                <strong>Edad:</strong> {petEdad || "-"} anos
              </li>
              <li>
                <strong>Peso:</strong> {petPeso || "-"} kg
              </li>
              <li>
                <strong>Fecha:</strong> {fecha ? new Date(fecha).toLocaleString() : "-"}
              </li>
              {tipoCita === "movil" && (
                <li>
                  <strong>Direccion:</strong> {user?.direccion || "Completa tu direccion en perfil"}
                </li>
              )}
            </ul>

            {error && (
              <p className="error-text" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="reserva-btn" disabled={loading}>
              {loading ? "Reservando..." : "Confirmar reserva"}
            </button>
          </aside>
        </div>
      </form>
    </section>
  );
}
