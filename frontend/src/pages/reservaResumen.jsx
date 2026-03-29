// src/pages/reservaResumen.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import '../styles/reservaResumen.css';

export default function ReservaResumen() {
  console.log('[ReservaResumen] render start');
  const { state } = useLocation();
  const navigate = useNavigate();
  const { fetchWithAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!state) {
      console.warn('[ReservaResumen] no state, redirigiendo a "/reservar"');
      navigate('/reservar', { replace: true });
    }
  }, [state, navigate]);

  if (!state) {
    return <div className="loading-spinner">Redirigiendo al formulario…</div>;
  }

  const { subservicio, tipo, mascota, fecha, motivo, direccion } = state;
  const formattedDate = new Date(fecha).toLocaleString(undefined, {
    dateStyle: 'long',
    timeStyle: 'short',
  });
  console.log('[ReservaResumen] datos recibidos:', { subservicio, tipo, mascota, fecha, motivo, direccion });

  const handleConfirm = async () => {
    console.log('[ReservaResumen] handleConfirm: iniciando confirmación');
    console.log('[ReservaResumen] payload:', { subservicio, tipo, mascota, fecha, motivo, ...(tipo === 'movil' && { direccion }) });
    setLoading(true);
    setError('');
    try {
      const { status, data } = await fetchWithAuth('/citas/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subservicio,
          tipo,
          mascota,
          fecha,
          motivo,
          ...(tipo === 'movil' && { direccion }),
        }),
      });
      console.log('[ReservaResumen] confirm response:', status, data);
      navigate('/reservar/exito', { state: { subservicio, tipo, mascota, fecha, motivo, direccion } });
    } catch (err) {
      console.error('[ReservaResumen] error al confirmar cita:', err);
      setError(err.message || 'Error al confirmar la cita. Intenta nuevamente.');
    } finally {
      setLoading(false);
      console.log('[ReservaResumen] handleConfirm finalizado, loading=false');
    }
  };

  return (
    <div className="resumen-page" role="region" aria-labelledby="resumen-title">
      <div className="resumen-card" role="dialog" aria-modal="true">
        <h2 id="resumen-title">Resumen de tu Reserva</h2>
        <ul className="resumen-details">
          <li><strong>Servicio:</strong> {subservicio}</li>
          <li>
            <strong>Tipo:</strong> {tipo === 'presencial' ? 'Presencial' : 'Móvil'}
          </li>
          <li><strong>Mascota:</strong> {mascota}</li>
          <li><strong>Fecha y hora:</strong> {formattedDate}</li>
          <li><strong>Motivo:</strong> {motivo}</li>
          {tipo === 'movil' && (
            <li><strong>Dirección:</strong> {direccion}</li>
          )}
        </ul>
        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}
        <div className="resumen-buttons" aria-label="Acciones">
          <button
            type="button"
            onClick={() => {
              console.log('[ReservaResumen] Volver clic, navega back');
              navigate('/');
            }}
            disabled={loading}
          >
            Volver
          </button>
          <button
            type="button"
            className="btn-confirm"
            onClick={() => {
              navigate('/');
            }}
            disabled={loading}
          >
            {loading ? 'Confirmando…' : 'Ver mis reservas'}
          </button>
        </div>
      </div>
    </div>
  );
}
