import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import ReservationDropdown from './reservationDropdown';
import '../styles/navbar.css';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const toggleDropdown = () => setOpen(prev => !prev);

  return (
    <header className="navbar">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between relative">
        <NavLink to="/" className="logo">Mascota Feliz</NavLink>
        <nav className="flex items-center relative">
          <NavLink to="/#servicios" className="nav-item">Servicios</NavLink>
          <NavLink to="/#nosotros" className="nav-item">Nosotros</NavLink>
          <NavLink to="/#contacto" className="nav-item">Contacto</NavLink>
          <div className="dropdown-wrapper">
            <button className="cta" onClick={toggleDropdown}>
              Reservar Cita
            </button>
            {open && <ReservationDropdown onClose={() => setOpen(false)} />}
          </div>
        </nav>
      </div>
    </header>
  );
}