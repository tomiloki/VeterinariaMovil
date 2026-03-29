import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/auth-context";
import { useScrollReveal } from "../hooks/useScrollReveal";
import "../styles/reservaExito.css";

const SERVICE_LABELS = {
  revision: "Revision clinica",
  aseo: "Arreglos y aseo",
  quirurgico: "Intervenciones quirurgicas",
};

export default function ReservaExito() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { fetchWithAuth } = useAuth();

  useEffect(() => {
    if (!state) {
      navigate("/", { replace: true });
    }
  }, [state, navigate]);

  useScrollReveal(".exito-page .reveal-on-scroll", String(Boolean(state)));

  if (!state) return null;

  const { citaId, subservicio, tipo, mascota, fecha, motivo, direccion } = state;

  const handlePago = async () => {
    try {
      const { data } = await fetchWithAuth("/pago/", {
        method: "POST",
        body: { cita_id: citaId },
      });

      const urlPago = data.url_pago || data.url;
      const token = data.token;
      if (!urlPago || !token) {
        throw new Error("No fue posible iniciar el pago.");
      }

      const form = document.createElement("form");
      form.method = "POST";
      form.action = urlPago;
      form.style.display = "none";

      const tokenInput = document.createElement("input");
      tokenInput.type = "hidden";
      tokenInput.name = "token_ws";
      tokenInput.value = token;
      form.appendChild(tokenInput);

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      alert(error.message || "No se pudo iniciar el pago. Intenta mas tarde.");
    }
  };

  const formattedDate = new Date(fecha).toLocaleString(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <main className="exito-page" role="region" aria-labelledby="exito-title">
      <div className="exito-card reveal-on-scroll" role="alert">
        <div className="exito-icon" aria-hidden="true">
          OK
        </div>
        <h2 id="exito-title">Reserva confirmada para tu mascota</h2>
        <p className="exito-subtitle">
          Ya dejamos todo agendado. Si quieres, puedes pagar ahora para llegar a la consulta con el proceso listo.
        </p>
        <ul className="exito-details">
          <li>
            <strong>Servicio:</strong> {SERVICE_LABELS[subservicio] || subservicio || "-"}
          </li>
          <li>
            <strong>Tipo:</strong> {tipo === "presencial" ? "Presencial" : "Movil"}
          </li>
          <li>
            <strong>Mascota:</strong> {mascota}
          </li>
          <li>
            <strong>Fecha:</strong> {formattedDate}
          </li>
          <li>
            <strong>Motivo:</strong> {motivo}
          </li>
          {tipo === "movil" && (
            <li>
              <strong>Direccion:</strong> {direccion}
            </li>
          )}
        </ul>

        <div className="exito-buttons" aria-label="Opciones tras reserva">
          <button type="button" className="btn-outline" onClick={() => navigate("/reservar", { replace: true })}>
            Agendar otra consulta
          </button>
          <button type="button" className="btn-solid" onClick={handlePago}>
            Pagar con Webpay
          </button>
          <button type="button" className="btn-outline" onClick={() => navigate("/", { replace: true })}>
            Ir al inicio
          </button>
        </div>
      </div>
    </main>
  );
}
