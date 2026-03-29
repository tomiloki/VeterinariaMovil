// src/components/ReservationDropdown.jsx
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import '../styles/reservationDropdown.css';

const options = [
  { key: 'presencial', label: 'Presencial', icon: '🏥' },
  { key: 'movil',      label: 'Veterinaria Móvil', icon: '🚐' },
];

export default function ReservationDropdown({ active, onSelect, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    // Enfocar el contenedor por accesibilidad
    menuRef.current?.focus();

    // Escuchar clicks fuera para cerrar
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        console.log('[ReservationDropdown] click fuera, cerrando menú');
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleKeyDown = (e, key) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(key);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="reservation-dropdown"
      role="menu"
      aria-label="Tipo de cita"
      tabIndex={-1}
      ref={menuRef}
    >
      {options.map(({ key, label, icon }) => (
        <div
          key={key}
          role="menuitemradio"
          aria-checked={active === key}
          tabIndex={0}
          className={`dropdown-item ${active === key ? 'active' : ''}`}
          onClick={() => {
            console.log('[ReservationDropdown] onClick select:', key);
            onSelect(key);
            onClose();
          }}
          onKeyDown={(e) => handleKeyDown(e, key)}
        >
          <span aria-hidden="true" className="icon">{icon}</span>
          {label}
        </div>
      ))}
    </div>
  );
}

ReservationDropdown.propTypes = {
  active:   PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  onClose:  PropTypes.func.isRequired,
};
