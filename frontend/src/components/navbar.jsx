import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/auth-context";
import { useCart } from "../contexts/cart-context";
import ReservationDropdown from "./reservationDropdown";
import "../styles/navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tipoCita, setTipoCita] = useState("presencial");
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setMenuOpen(false);
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closePanels = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  const handleSelect = (tipo) => {
    setTipoCita(tipo);
    closePanels();
    navigate(`/reservar?tipo=${tipo}`);
  };

  return (
    <header className="navbar" ref={wrapperRef}>
      <div className="navbar-inner">
        <NavLink to="/" className="logo" onClick={closePanels}>
          <span className="logo-badge" aria-hidden="true">
            MF
          </span>
          <span>
            <strong>Mascota Feliz</strong>
            <small>Clinica & farmacia veterinaria</small>
          </span>
        </NavLink>

        <button type="button" className="hamburger" aria-label="Abrir menu" onClick={() => setMenuOpen((open) => !open)}>
          Menu
        </button>

        <nav className={`navbar-nav ${menuOpen ? "open" : ""}`}>
          <a href="/#servicios" className="nav-item" onClick={closePanels}>
            Servicios
          </a>
          <a href="/#nosotros" className="nav-item" onClick={closePanels}>
            Clinica
          </a>
          <a href="/#contacto" className="nav-item" onClick={closePanels}>
            Contacto
          </a>

          {user ? (
            <>
              <NavLink to="/farmacia" className="nav-item" onClick={closePanels}>
                Farmacia
              </NavLink>
              <NavLink to="/carrito" className="nav-item nav-cart" onClick={closePanels}>
                Carrito
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </NavLink>

              <div className="dropdown-wrapper">
                <button type="button" className="btn-secondary nav-reserve" onClick={() => setDropdownOpen((open) => !open)}>
                  Reservar consulta
                </button>
                {dropdownOpen && (
                  <ReservationDropdown active={tipoCita} onSelect={handleSelect} onClose={() => setDropdownOpen(false)} />
                )}
              </div>

              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  closePanels();
                  navigate("/perfil");
                }}
              >
                Perfil
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  closePanels();
                  logout();
                }}
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-item" onClick={closePanels}>
                Ingresar
              </NavLink>
              <NavLink to="/register" className="nav-item" onClick={closePanels}>
                Crear cuenta
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
