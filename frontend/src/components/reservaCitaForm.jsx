// frontend/src/pages/ReservaCitaForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/authContext';
import '../styles/reservaCitaForm.css';

export default function ReservaCitaForm() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ESTADOS
  const [tipoCita, setTipoCita]           = useState('presencial');
  const [subservicio, setSubservicio]     = useState('');
  const [petNombre, setPetNombre]         = useState('');
  const [petEspecie, setPetEspecie]       = useState('');
  const [petRaza, setPetRaza]             = useState('');
  const [fecha, setFecha]                 = useState('');
  const [motivo, setMotivo]               = useState('');

  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  // MAPA para etiqueta legible de servicio
  const labels = {
    revision:    'Revisión clínica',
    aseo:        'Arreglos y aseo',
    quirurgico:  'Intervenciones quirúrgicas',
  };

  const handleSubmit = async e => {
    e.preventDefault();
    console.log('🔔 handleSubmit invocado');
    console.log({ tipoCita, subservicio, petNombre, petEspecie, petRaza, fecha, motivo, user });
    // VALIDACIONES
    if (!subservicio) {
      setError('Selecciona un tipo de servicio.');
      return;
    }
    if (!petNombre || !petEspecie) {
      setError('Ingresa nombre y especie de la mascota.');
      return;
    }
    if (petEspecie === 'perro' && !petRaza) {
      setError('Indica la raza de tu perro.');
      return;
    }
    if (!fecha) {
      setError('Debes escoger fecha y hora.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // 1) Crear Mascota incluyendo usuario
      const { data: mascota } = await api.post('mascotas/', {
        nombre:  petNombre,
        especie: petEspecie,
        raza:    petEspecie === 'perro' ? petRaza : '',
        usuario: user.id,            // ← aquí
      });

      // 2) Crear Cita
      await api.post('citas/', {
        fecha,
        tipo:        tipoCita,
        subservicio,
        mascota:     mascota.id,
        motivo,
        direccion:   tipoCita === 'movil' ? user.direccion : ''
      });

      navigate('/reserva-exito');
    } catch {
      setError('Error al reservar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="reserva-form" onSubmit={handleSubmit}>
      <h2>Reservar Cita</h2>

      {/* 1. Selección de Presencial vs Móvil */}
      <div className="field-group tipo-group">
        <label>Tipo de cita:</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              value="presencial"
              checked={tipoCita === 'presencial'}
              onChange={() => setTipoCita('presencial')}
            /> Presencial
          </label>
          <label>
            <input
              type="radio"
              value="movil"
              checked={tipoCita === 'movil'}
              onChange={() => setTipoCita('movil')}
            /> Móvil
          </label>
        </div>
      </div>

      {/* 2. Subservicio */}
      <div className="field-group">
        <label htmlFor="subservicio">Servicio:</label>
        <select
          id="subservicio"
          value={subservicio}
          onChange={e => setSubservicio(e.target.value)}
        >
          <option value="">-- Selecciona servicio --</option>
          <option value="revision">Revisión clínica</option>
          <option value="aseo">Arreglos y aseo</option>
          <option value="quirurgico">Interv. quirúrgicas</option>
        </select>
      </div>

      {/* 3. Datos mascota */}
      <div className="field-group">
        <label htmlFor="petNombre">Nombre mascota:</label>
        <input
          id="petNombre"
          type="text"
          value={petNombre}
          onChange={e => setPetNombre(e.target.value)}
          placeholder="Ej: Rocky"
        />
      </div>
      <div className="field-group">
        <label htmlFor="petEspecie">Especie:</label>
        <select
          id="petEspecie"
          value={petEspecie}
          onChange={e => setPetEspecie(e.target.value)}
        >
          <option value="">-- Elige especie --</option>
          <option value="perro">Perro</option>
          <option value="gato">Gato</option>
        </select>
      </div>
      {petEspecie === 'perro' && (
        <div className="field-group">
          <label htmlFor="petRaza">Raza:</label>
          <input
            id="petRaza"
            type="text"
            value={petRaza}
            onChange={e => setPetRaza(e.target.value)}
            placeholder="Ej: Labrador"
          />
        </div>
      )}

      {/* 4. Fecha y motivo */}
      <div className="field-group">
        <label htmlFor="fecha">Fecha y hora:</label>
        <input
          id="fecha"
          type="datetime-local"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
        />
      </div>
      <div className="field-group">
        <label htmlFor="motivo">Motivo:</label>
        <textarea
          id="motivo"
          rows="3"
          value={motivo}
          onChange={e => setMotivo(e.target.value)}
          placeholder="¿Por qué vienes?"
        />
      </div>

      {/* 5. Resumen dinámico */}
      <div className="detail-group">
        <h3>Tu reserva</h3>
        <ul>
          <li><strong>Tipo:</strong> {tipoCita === 'movil' ? 'Móvil' : 'Presencial'}</li>
          <li><strong>Servicio:</strong> {labels[subservicio] || '—'}</li>
          <li><strong>Mascota:</strong> {petNombre || '—'} ({petEspecie || '—'})</li>
          {petEspecie==='perro' && <li><strong>Raza:</strong> {petRaza || '—'}</li>}
          <li><strong>Fecha:</strong> {fecha ? new Date(fecha).toLocaleString() : '—'}</li>
        </ul>
      </div>

      {error && <p className="error-text">{error}</p>}

      <button type="submit" className="reserva-btn" disabled={loading}>
        {loading ? 'Reservando...' : 'Confirmar Reserva'}
      </button>
    </form>
  );
}