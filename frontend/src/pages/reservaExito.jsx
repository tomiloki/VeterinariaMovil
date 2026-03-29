// src/pages/reservaExito.jsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import '../styles/reservaExito.css';

export default function ReservaExito() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { fetchWithAuth } = useAuth();

  useEffect(() => {
    if (!state) {
      navigate('/', { replace: true });
    }
  }, [state, navigate]);

  if (!state) return null;

  const { citaId, tipo, mascota, fecha, motivo, direccion } = state;

  const handlePago = async () => {
    console.log('[ReservaExito] Iniciando pago para cita', citaId);

    try {
      // fetchWithAuth antepone "/api" automáticamente
      const { status, data } = await fetchWithAuth('/pago/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cita_id: citaId }),
      });

      if (status !== 200) {
        throw new Error(data?.detail || 'Error al iniciar el pago');
      }

      const url   = data.url || data.url_pago;  // según cómo responda tu backend
      const token = data.token;                 // token_ws

      console.log('[ReservaExito] Redirigiendo vía POST a:', url);

      /* ---------- Webpay requiere POST token_ws ---------- */
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = url;
      form.style.display = 'none';

      const input = document.createElement('input');
      input.type  = 'hidden';
      input.name  = 'token_ws';
      input.value = token;
      form.appendChild(input);

      document.body.appendChild(form);
      form.submit();        // ← el navegador hace POST y muestra Webpay
    } catch (err) {
      console.error('[ReservaExito] Error al crear pago:', err);
      alert(err.message || 'No se pudo iniciar el pago. Intenta más tarde.');
    }
  };


  const formattedDate = new Date(fecha).toLocaleString(undefined, {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  return (
    <main className="exito-page" role="region" aria-labelledby="exito-title">
      <div className="exito-card" role="alert">
        <div className="exito-icon" aria-hidden="true">✅</div>
        <h2 id="exito-title">¡Cita Reservada!</h2>
        <ul className="exito-details">
          <li><strong>Tipo:</strong> {tipo === 'presencial' ? 'Presencial' : 'Móvil'}</li>
          <li><strong>Mascota:</strong> {mascota}</li>
          <li><strong>Fecha:</strong> {formattedDate}</li>
          <li><strong>Motivo:</strong> {motivo}</li>
          {tipo === 'movil' && <li><strong>Dirección:</strong> {direccion}</li>}
        </ul>

        <div className="exito-buttons" aria-label="Opciones tras reserva">
          <button
            type="button"
            className="btn-outline"
            onClick={() => navigate('/reservar', { replace: true })}
          >
            Agendar Otra
          </button>

          <button
            type="button"
            className="btn-solid"
            onClick={handlePago}
          >
            Pagar Ahora
          </button>

          <button
            type="button"
            className="btn-outline"
            onClick={() => navigate('/', { replace: true })}
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    </main>
  );
}
