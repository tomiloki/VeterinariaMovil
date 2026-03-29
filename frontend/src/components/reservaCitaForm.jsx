// src/components/reservaCitaForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import '../styles/reservaCitaForm.css';

const OPCIONES_SUBSERVICIO = [
  { value: 'revision', label: 'Revisión clínica' },
  { value: 'aseo',     label: 'Arreglos y aseo' },
  { value: 'cirugia',  label: 'Intervenciones quirúrgicas' },
];

export default function ReservaCitaForm() {
  const { user, fetchWithAuth, logout } = useAuth();
  const navigate = useNavigate();

  // Estados de formulario
  const [tipoCita, setTipoCita]       = useState('presencial');
  const [subservicio, setSubservicio] = useState('revision');
  const [petNombre, setPetNombre]     = useState('');
  const [petEspecie, setPetEspecie]   = useState('');
  const [petRaza, setPetRaza]         = useState('');
  // NUEVOS: edad y peso
  const [petEdad, setPetEdad]         = useState('');
  const [petPeso, setPetPeso]         = useState('');

  const [fecha, setFecha]             = useState('');
  const [motivo, setMotivo]           = useState('');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);

  const labels = {
    revision:   'Revisión clínica',
    aseo:       'Arreglos y aseo',
    quirurgico: 'Intervenciones quirúrgicas',
  };
  const servicios = Object.keys(labels);

  const handleSubmit = async e => {
    e.preventDefault();

    console.log('[ReservaCitaForm] Submitting:', {
      tipoCita, subservicio, petNombre, petEspecie, petRaza, petEdad, petPeso, fecha, motivo
    });

    // Validaciones básicas
    if (!subservicio) {
      setError('Selecciona un servicio.');
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
    if (!petEdad) {
      setError('Ingresa la edad de la mascota.');
      return;
    }
    if (!petPeso) {
      setError('Ingresa el peso de la mascota.');
      return;
    }
    if (!fecha) {
      setError('Debes escoger fecha y hora.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // 1) Crear Mascota
      const mascotaPayload = {
        nombre:  petNombre,
        especie: petEspecie,
        raza:    petEspecie === 'perro' ? petRaza : '',
        edad:    Number(petEdad),
        peso:    Number(petPeso),
      };
      console.log('[ReservaCitaForm] Mascota payload:', mascotaPayload);

      const { data: mascota } = await fetchWithAuth('/mascotas/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mascotaPayload),
      });
      console.log('[ReservaCitaForm] Mascota creada:', mascota);

      // 2) Crear Cita
      const citaPayload = {
        fecha,
        tipo:        tipoCita,
        subservicio,
        mascota:     mascota.id,
        motivo,
        ...(tipoCita === 'movil' && { direccion: user.direccion }),
      };
      console.log('[ReservaCitaForm] Cita payload:', citaPayload);

      const { data: cita } = await fetchWithAuth('/citas/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(citaPayload),
      });
      console.log('[ReservaCitaForm] Cita creada:', cita);

      navigate('/reservar/exito', {
        state: {
          citaId: cita.id,        // aquí el ID que necesitaremos luego
          tipo: tipoCita,
          mascota: mascota.nombre, // o mascota.id si prefieres
          fecha,
          motivo,
          ...(tipoCita === 'movil' && { direccion: user.direccion }),
        }
      });
    } catch (err) {
      console.error('[ReservaCitaForm] Error durante reserva:', err);
      // Si es 401, forzamos logout
      if (err.message.includes('Sesión expirada')) {
        logout();
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
      console.log('[ReservaCitaForm] handleSubmit terminado');
    }
  };

  return (
    <form className="reserva-form" onSubmit={handleSubmit} noValidate>
      <h2>Reservar Cita</h2>

      {/* Tipo de cita */}
      <div className="field-group tipo-group">
        <label>Tipo de cita:</label>
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

      {/* Servicio */}
      <div className="field-group">
        <label htmlFor="subservicio">Servicio:</label>
        <select
          id="subservicio"
          value={subservicio}
          onChange={(e) => setSubservicio(e.target.value)}
        >
          {OPCIONES_SUBSERVICIO.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Datos de la mascota */}
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
            placeholder="Ej: Chihuahua"
          />
        </div>
      )}

      {/* Edad y Peso obligatorios */}
      <div className="field-group">
        <label htmlFor="petEdad">Edad (años):</label>
        <input
          id="petEdad"
          type="number"
          min="0"
          value={petEdad}
          onChange={e => setPetEdad(e.target.value)}
          placeholder="Ej: 3"
        />
      </div>
      <div className="field-group">
        <label htmlFor="petPeso">Peso (kg):</label>
        <input
          id="petPeso"
          type="number"
          min="0"
          step="0.1"
          value={petPeso}
          onChange={e => setPetPeso(e.target.value)}
          placeholder="Ej: 4.5"
        />
      </div>

      {/* Fecha y motivo */}
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
          placeholder="Describe el motivo de la visita"
        />
      </div>

      {/* Vista previa */}
      <div className="detail-group">
        <h3>Tu reserva</h3>
        <ul>
          <li><strong>Tipo:</strong> {tipoCita === 'movil' ? 'Móvil' : 'Presencial'}</li>
          <li><strong>Servicio:</strong> {labels[subservicio] || '—'}</li>
          <li><strong>Nombre mascota:</strong> {petNombre || '—'}</li>
          <li><strong>Especie:</strong> {petEspecie || '—'}</li>
          {petEspecie === 'perro' && <li><strong>Raza:</strong> {petRaza || '—'}</li>}
          <li><strong>Edad:</strong> {petEdad || '—'} años</li>
          <li><strong>Peso:</strong> {petPeso || '—'} kg</li>
          <li><strong>Fecha:</strong> {fecha ? new Date(fecha).toLocaleString() : '—'}</li>
        </ul>
      </div>

      {error && <p className="error-text" role="alert">{error}</p>}

      <button type="submit" className="reserva-btn" disabled={loading}>
        {loading ? 'Reservando...' : 'Confirmar Reserva'}
      </button>
    </form>
  );
}
