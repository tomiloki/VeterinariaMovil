// src/components/Navbar.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import ReservationDropdown from './ReservationDropdown'; // Asegúrate de que el nombre del archivo coincida
import '../styles/navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen]         = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [tipoCita, setTipoCita] = useState('presencial');

  const handleLinkClick = () => {
    setShowMenu(false);
    setOpen(false);
    if (e.shiftKey) {
      logout();
      navigate('/login');
    }

  };

  const handleLogoClick = e => {
    if (e.shiftKey) {
      logout();
      navigate('/login');
    }
  };

  const handleSelect = tipo => {
    setTipoCita(tipo);
    setOpen(false);
    // Navega pasando el tipo como query param
    navigate(`/reservar?tipo=${tipo}`);
  };

  return (
    <header className="navbar">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between relative">
        <NavLink to="/" className="logo" onClick={handleLinkClick}>
          Mascota Feliz
        </NavLink>

        {/* Botón hamburguesa para móvil */}
        <button
          className="hamburger"
          aria-label="Menú"
          onClick={() => setShowMenu(s => !s)}
        >
          ☰
        </button>

        <nav className={showMenu ? 'open' : ''}>
          <NavLink to="/#servicios" className="nav-item" onClick={handleLinkClick}>
            Servicios
          </NavLink>
          <NavLink to="/#nosotros" className="nav-item" onClick={handleLinkClick}>
            Nosotros
          </NavLink>
          <NavLink to="/#contacto" className="nav-item" onClick={handleLinkClick}>
            Contacto
          </NavLink>
          <NavLink to="/login" className="nav-auth" onClick={handleLinkClick}>
            Login
          </NavLink>
          <NavLink to="/register" className="nav-auth" onClick={handleLinkClick}>
            Registro
          </NavLink>

          <div className="dropdown-wrapper">
            <button className="cta" onClick={() => setOpen(o => !o)}>
              Reservar Cita
            </button>
            {open && (
              <ReservationDropdown
                active={tipoCita}
                onSelect={handleSelect}
                onClose={() => setOpen(false)}
              />
            )}
          </div>
        </nav>
      </div>
    </header>
);
}