// frontend/src/components/ReservaCitaForm.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/reservaCitaForm.css';

export default function ReservaCitaForm() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const tipoParam = params.get('tipo') || 'presencial';

  const [fecha, setFecha] = useState('');
  const [direccion, setDireccion] = useState('');
  const [especie, setEspecie] = useState('');              // ← inicial vacío
  const [motivo, setMotivo] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!['presencial', 'movil'].includes(tipoParam)) {
      navigate('/');
    }
  }, [tipoParam, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        fecha,
        tipo: tipoParam,
        mascota: especie,    // ahora puede estar vacío si no seleccionas
        motivo,
        direccion: tipoParam === 'movil' ? direccion : '',
      };
      await api.post('citas/', payload);
      setMessage('¡Cita reservada con éxito!');
    } catch {
      setMessage('Error al reservar la cita.');
    }
  };

  return (
    <div className="reserva-container">
      <div className="reserva-card">
        <h2 className="reserva-title">
          Reservar Cita ({tipoParam === 'movil' ? 'Móvil' : 'Presencial'})
        </h2>
        {message && <p className="reserva-message">{message}</p>}
        <form className="reserva-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fecha">Fecha y hora:</label>
            <input
              id="fecha"
              type="datetime-local"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              required
            />
          </div>

          {tipoParam === 'movil' && (
            <div className="form-group">
              <label htmlFor="direccion">Dirección:</label>
              <input
                id="direccion"
                type="text"
                placeholder="Calle, número, comuna"
                value={direccion}
                onChange={e => setDireccion(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="especie">Especie:</label>
            <select
              id="especie"
              value={especie}
              onChange={e => setEspecie(e.target.value)}
              required
            >
              <option value="" disabled>
                -- Selecciona especie --
              </option>
              <option value="perro">Perro</option>
              <option value="gato">Gato</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="motivo">Motivo:</label>
            <textarea
              id="motivo"
              rows="4"
              placeholder="Describe el motivo de la cita"
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              required
            />
          </div>

          <button type="submit">Reservar</button>
        </form>
      </div>
    </div>
  );
}