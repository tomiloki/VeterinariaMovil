import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/reservaResumen.css'; // crea este CSS si quieres

export default function ReservaResumen() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Si no vienen datos, volvemos al formulario
  if (!state) {
    navigate('/reservar');
    return null;
  }

  const { tipo, mascota, fecha, motivo, direccion } = state;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await api.post('citas/', {
        tipo,
        mascota,
        fecha,
        motivo,
        ...(tipo === 'movil' && { direccion }),
      });
      // tras éxito, ir a home (o a /reservar/exito cuando lo crees)
      navigate('/');
    } catch {
      setError('Error al confirmar la cita. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resumen-page">
      <div className="resumen-card">
        <h2>Resumen de tu Cita</h2>
        <ul>
          <li><strong>Tipo:</strong> {tipo === 'presencial' ? 'Presencial' : 'Móvil'}</li>
          <li><strong>Mascota:</strong> {mascota}</li>
          <li><strong>Fecha y hora:</strong> {new Date(fecha).toLocaleString()}</li>
          <li><strong>Motivo:</strong> {motivo}</li>
          {tipo === 'movil' && (
            <li><strong>Dirección:</strong> {direccion}</li>
          )}
        </ul>

        {error && <p className="error-text">{error}</p>}

        <div className="resumen-buttons">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Volver
          </button>
          <button
            type="button"
            className="btn-confirm"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Confirmando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
