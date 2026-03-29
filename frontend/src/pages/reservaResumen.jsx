import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useScrollReveal } from "../hooks/useScrollReveal";
import "../styles/reservaResumen.css";

const SERVICE_LABELS = {
  revision: "Revision clinica",
  aseo: "Arreglos y aseo",
  quirurgico: "Intervenciones quirurgicas",
};

function getWebpayLabel(webpayStatus) {
  if (webpayStatus === "AUTHORIZED") {
    return "Autorizado";
  }
  if (webpayStatus === "FAILED") {
    return "Rechazado";
  }
  if (!webpayStatus) {
    return "Sin informacion";
  }
  return webpayStatus;
}

export default function ReservaResumen() {
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state) {
      navigate("/", { replace: true });
    }
  }, [state, navigate]);

  useScrollReveal(".resumen-page .reveal-on-scroll", String(Boolean(state)));

  if (!state) {
    return <div className="loading-spinner">Cargando confirmacion...</div>;
  }

  const {
    estado_pago: estadoPago,
    subservicio,
    tipo,
    mascota,
    fecha,
    motivo,
    detalle,
    webpay_status: webpayStatus,
  } = state;

  const isAuthorized = estadoPago === "AUTHORIZED";
  const formattedDate = fecha ? new Date(fecha).toLocaleString() : "-";
  const paymentLabel = isAuthorized ? "Pago aprobado" : "Pago no confirmado";
  const paymentDetail = detalle || (isAuthorized ? "Tu reserva quedo pagada correctamente." : "No logramos confirmar el pago.");

  return (
    <div className="resumen-page" role="region" aria-labelledby="resumen-title">
      <div className="resumen-card reveal-on-scroll" role="dialog" aria-modal="true">
        <h2 id="resumen-title">{isAuthorized ? "Tu cita quedo confirmada" : "Revisa el estado de tu pago"}</h2>
        <p className="resumen-subtitle">
          {isAuthorized
            ? "Listo, tu atencion veterinaria esta reservada y pagada."
            : "Puedes intentar nuevamente el pago o reservar otra hora cuando quieras."}
        </p>

        <span className={`payment-status ${isAuthorized ? "success" : "failed"}`}>{paymentLabel}</span>

        <ul className="resumen-details">
          <li>
            <strong>Detalle:</strong> {paymentDetail}
          </li>
          <li>
            <strong>Servicio:</strong> {SERVICE_LABELS[subservicio] || subservicio || "-"}
          </li>
          <li>
            <strong>Tipo:</strong> {tipo === "movil" ? "Movil" : "Presencial"}
          </li>
          <li>
            <strong>Mascota:</strong> {mascota || "-"}
          </li>
          <li>
            <strong>Fecha:</strong> {formattedDate}
          </li>
          <li>
            <strong>Motivo:</strong> {motivo || "-"}
          </li>
          <li>
            <strong>Estado en Webpay:</strong> {getWebpayLabel(webpayStatus)}
          </li>
        </ul>

        <div className="resumen-buttons" aria-label="Acciones">
          <button type="button" onClick={() => navigate("/reservar")}>
            Agendar otra cita
          </button>
          <button type="button" className="btn-confirm" onClick={() => navigate("/")}>
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
