// src/components/navbar.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import ReservationDropdown from './reservationDropdown';
import '../styles/navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tipoCita, setTipoCita] = useState('presencial');

  const isAuthenticated = Boolean(user);

  useEffect(() => {
    console.log('[Navbar] State:', {
      user,
      isAuthenticated,
      menuOpen,
      dropdownOpen,
      tipoCita,
    });
  }, [user, isAuthenticated, menuOpen, dropdownOpen, tipoCita]);

  const handleLinkClick = () => {
    console.log('[Navbar] Closing menus');
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  const handleSelect = (tipo) => {
    console.log('[Navbar] Selected tipo de cita:', tipo);
    setTipoCita(tipo);
    setDropdownOpen(false);
    navigate(`/reservar?tipo=${tipo}`);
    console.log('[Navbar] Navigated to:', `/reservar?tipo=${tipo}`);
  };

  const handleLogout = () => {
    console.log('[Navbar] Logout clicked');
    logout();
    console.log('[Navbar] Logout completed');
  };

  return (
    <header className="navbar">
      <div className="container">
        <NavLink to="/" className="logo" onClick={handleLinkClick}>
          Mascota Feliz
        </NavLink>

        <button
          className="hamburger"
          aria-label="Menú"
          onClick={(e) => {
            e.stopPropagation();
            console.log('[Navbar] Hamburger click, open:', !menuOpen);
            setMenuOpen(o => !o);
          }}
        >
          ☰
        </button>

        <nav className={menuOpen ? 'open' : ''}>
          <NavLink to="/#servicios" className="nav-item" onClick={handleLinkClick}>
            Servicios
          </NavLink>
          <NavLink to="/#nosotros" className="nav-item" onClick={handleLinkClick}>
            Nosotros
          </NavLink>
          <NavLink to="/#contacto" className="nav-item" onClick={handleLinkClick}>
            Contacto
          </NavLink>

          {isAuthenticated ? (
            <div className="actions">
              <div
                className="dropdown-wrapper"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <button
                  className="btn-reservar"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('[Navbar] Reservar Cita click, toggle open:', !dropdownOpen);
                    setDropdownOpen(o => !o);
                  }}
                >
                  <i className="fas fa-calendar-plus" aria-hidden="true" />
                  Reservar Cita
                </button>

                {dropdownOpen && (
                  <ReservationDropdown
                    active={tipoCita}
                    onSelect={handleSelect}
                    onClose={() => {
                      console.log('[Navbar] Closing dropdown');
                      setDropdownOpen(false);
                    }}
                  />
                )}
              </div>

              <button
                className="icon-btn"
                onClick={() => {
                  console.log('[Navbar] Perfil click, navigating to /perfil');
                  navigate('/perfil');
                }}
                aria-label="Perfil"
              >
                <i className="fas fa-user-circle" aria-hidden="true" />
              </button>

              <button
                className="icon-btn"
                onClick={handleLogout}
                aria-label="Cerrar Sesión"
              >
                <i className="fas fa-sign-out-alt" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="actions">
              <NavLink to="/login" className="nav-item" onClick={handleLinkClick}>
                Login
              </NavLink>
              <NavLink to="/register" className="nav-item" onClick={handleLinkClick}>
                Registro
              </NavLink>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
