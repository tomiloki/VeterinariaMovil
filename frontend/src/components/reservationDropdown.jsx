// src/components/ReservationDropdown.jsx
import React from 'react';
import PropTypes from 'prop-types';
import '../styles/reservationDropdown.css';

export default function ReservationDropdown({ active, onSelect, onClose }) {
  return (
    <div className="reservation-dropdown">
      <button
        className={`dropdown-item ${active === 'presencial' ? 'active' : ''}`}
        onClick={() => { onSelect('presencial'); onClose(); }}
      >
        🏥 Presencial
      </button>
      <button
        className={`dropdown-item ${active === 'movil' ? 'active' : ''}`}
        onClick={() => { onSelect('movil'); onClose(); }}
      >
        🚐 Veterinaria Móvil
      </button>
    </div>
  );
}

ReservationDropdown.propTypes = {
  active:  PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};