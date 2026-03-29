import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { apiRequest, extractApiError } from "../services/api";
import "../styles/pagoOrdenReturn.css";

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export default function PagoOrdenReturn() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const tokenWs = params.get("token_ws");

    if (!tokenWs) {
      setLoading(false);
      setResult({
        estado_pago: "FAILED",
        detalle: "No se recibio token de confirmacion.",
      });
      return;
    }

    const confirmPayment = async () => {
      const response = await apiRequest("/pago/orden/commit/", {
        method: "POST",
        body: { token_ws: tokenWs },
      });

      if (response.ok) {
        setResult(response.data);
      } else {
        setResult({
          ...(response.data || {}),
          estado_pago: "FAILED",
          detalle: extractApiError(response.data, "No se pudo confirmar el pago de la orden."),
        });
      }
      setLoading(false);
    };

    confirmPayment();
  }, [search]);

  if (loading) {
    return <div className="loading-spinner">Confirmando pago de la orden...</div>;
  }

  const authorized = result?.estado_pago === "AUTHORIZED";
  const paymentLabel = authorized ? "Pago aprobado" : "Pago no confirmado";

  return (
    <section className="pago-orden-page page-shell">
      <h1>{authorized ? "Tu compra quedo pagada" : "No pudimos confirmar tu pago"}</h1>
      <p className="pago-orden-subtitle">
        {authorized
          ? "Gracias por tu compra. Prepararemos tu pedido para despacho o retiro."
          : "Puedes volver a intentarlo desde el carrito cuando quieras."}
      </p>

      <span className={`payment-status ${authorized ? "success" : "failed"}`}>{paymentLabel}</span>

      <ul>
        <li>
          <strong>Detalle:</strong> {result?.detalle || "Sin detalle"}
        </li>
        <li>
          <strong>Orden:</strong> #{result?.orden_id || "-"}
        </li>
        <li>
          <strong>Total:</strong> {result?.total ? formatCurrency(result.total) : "-"}
        </li>
      </ul>
      <div className="pago-orden-actions">
        <button type="button" className="btn-ghost" onClick={() => navigate("/farmacia")}>
          Volver a farmacia
        </button>
        <button type="button" className="btn-primary" onClick={() => navigate("/")}>
          Volver al inicio
        </button>
      </div>
    </section>
  );
}
