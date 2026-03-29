import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { apiRequest, extractApiError } from "../services/api";

export default function PagoReturn() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Estamos confirmando tu pago...");

  useEffect(() => {
    const params = new URLSearchParams(search);
    const tokenWs = params.get("token_ws");

    if (!tokenWs) {
      navigate("/reservar/confirmar", {
        replace: true,
        state: {
          estado_pago: "FAILED",
          detalle: "No se recibio token de confirmacion.",
        },
      });
      return;
    }

    const confirmPayment = async () => {
      const response = await apiRequest("/pago/commit/", {
        method: "POST",
        body: { token_ws: tokenWs },
      });

      if (response.ok) {
        navigate("/reservar/confirmar", {
          replace: true,
          state: response.data,
        });
        return;
      }

      setMessage("No se pudo confirmar el pago.");
      navigate("/reservar/confirmar", {
        replace: true,
        state: {
          ...(response.data || {}),
          estado_pago: "FAILED",
          detalle: extractApiError(response.data, "No se pudo confirmar el pago."),
        },
      });
    };

    confirmPayment();
  }, [navigate, search]);

  return (
    <div className="page-shell" style={{ maxWidth: "520px", margin: "0 auto" }}>
      <h2>{message}</h2>
    </div>
  );
}
