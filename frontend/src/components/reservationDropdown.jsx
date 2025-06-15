import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/reservationDropdown.css';

export default function ReservationDropdown({ onClose }) {
  return (
    <div className="reservation-dropdown">
      <NavLink
        to="/reservar?tipo=presencial"
        className="dropdown-item"
        onClick={onClose}
      >
        Presencial
      </NavLink>
      <NavLink
        to="/reservar?tipo=movil"
        className="dropdown-item"
        onClick={onClose}
      >
        Móvil a domicilio
      </NavLink>
    </div>
  );
}