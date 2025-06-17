import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/reservaExito.css';

export default function ReservaExito() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Si no llegamos por confirmación, redirigimos al home
  if (!state) {
    navigate('/');
    return null;
  }
  const { tipo, mascota, fecha, motivo, direccion } = state;

  return (
    <div className="exito-page">
      <div className="exito-card">
        <div className="exito-icon">✅</div>
        <h2>¡Cita Reservada!</h2>

        <ul className="exito-details">
          <li><strong>Tipo:</strong> {tipo === 'presencial' ? 'Presencial' : 'Móvil'}</li>
          <li><strong>Mascota:</strong> {mascota}</li>
          <li><strong>Fecha:</strong> {new Date(fecha).toLocaleString()}</li>
          <li><strong>Motivo:</strong> {motivo}</li>
          {tipo === 'movil' && (
            <li><strong>Dirección:</strong> {direccion}</li>
          )}
        </ul>

        <div className="exito-buttons">
          <button onClick={() => navigate('/reservar')} className="btn-outline">
            Agendar Otra
          </button>
          <button onClick={() => navigate('/')} className="btn-solid">
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
}