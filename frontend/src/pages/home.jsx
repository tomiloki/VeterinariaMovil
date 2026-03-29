// frontend/src/pages/home.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import ReservationDropdown from '../components/reservationDropdown';
import '../styles/home.css';

export default function Home() {
  const [open, setOpen] = useState(false);
  const { hash } = useLocation();
  const navigate = useNavigate();

  // Scroll suave al hacer click en ancla
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [hash]);

  const handleTipoSelect = tipo => {
    setOpen(false);
    navigate(`/reservar?tipo=${tipo}`);
  };

  return (
    <div className="home-page">
      {/* — HERO — */}
      <section className="hero" id="hero">
        <div className="container hero-content">
          <h1 className="title">Bienvenido a Mascota Feliz</h1>
          <p className="subtitle">
            Cuidamos a tu mejor amigo con pasión y profesionalismo.
          </p>
          <div className="reservation-wrapper">
            <button className="btn" onClick={() => setOpen(v => !v)}>
              Reserva una Cita Ahora
            </button>
            {open && (
              <ReservationDropdown
                onSelect={handleTipoSelect}
                onClose={() => setOpen(false)}
              />
            )}
          </div>
        </div>
      </section>

      {/* — NUESTROS SERVICIOS — */}
      <section id="servicios" className="services-section">
        <h3 className="section-title">Nuestros Servicios</h3>
        <div className="container services-grid">
          {[
            {
              title: 'Citas Presenciales',
              desc: 'Atención en nuestra clínica con los mejores profesionales.',
              link: '/reservar?tipo=presencial',
              icon: '🏥',
            },
            {
              title: 'Veterinaria Móvil',
              desc: 'Llevamos el consultorio a tu hogar con insumos y medicamentos.',
              link: '/reservar?tipo=movil',
              icon: '🚐',
            },
            {
              title: 'Farmacia Online',
              desc: 'Compra productos y medicamentos con entrega rápida.',
              link: '/farmacia',
              icon: '💊',
            },
          ].map(item => (
            <NavLink
              to={item.link}
              key={item.title}
              className="service-card-link"
            >
              <div className="service-card">
                <div className="icon-wrapper">
                  <span className="icon">{item.icon}</span>
                </div>
                <h4 className="card-title">{item.title}</h4>
                <p className="card-desc">{item.desc}</p>
              </div>
            </NavLink>
          ))}
        </div>
      </section>

      {/* — SOBRE NOSOTROS — */}
      <section id="nosotros" className="about-section">
        <div className="container about-content">
          <h3 className="section-title">Sobre Nosotros</h3>
          <p className="about-text">
            En Mascota Feliz ofrecemos atención veterinaria integral: consultas,
            cirugías menores y seguimiento posterior. Nuestra unidad móvil está
            equipada para llevar el consultorio directamente a tu hogar.
          </p>
          <ul className="about-list">
            <li>Equipo de veterinarios certificados.</li>
            <li>Atención a domicilio y en clínica.</li>
            <li>Farmacia con entrega en 24 horas.</li>
            <li>Agenda online fácil y rápida.</li>
          </ul>
        </div>
      </section>

      {/* — CONTÁCTANOS — */}
      <section id="contacto" className="contact-section">
        <div className="container contact-content">
          <h3 className="section-title">Contáctanos</h3>
          <div className="contact-info">
            <p className="contact-text">
              Escríbenos para cualquier duda o para reservar tu cita móvil.
            </p>
            <ul className="contact-list">
              <li>📞 Teléfono: +56 9 1234 5678</li>
              <li>✉ Email: contacto@mascotafeliz.cl</li>
              <li>📍 Av. Ejemplo 123, Santiago, Chile</li>
            </ul>
          </div>
          <form className="form-fields">
            <input
              type="text"
              placeholder="Tu nombre"
              className="form-input"
            />
            <input
              type="email"
              placeholder="Tu correo"
              className="form-input"
            />
            <textarea
              placeholder="Mensaje"
              className="form-textarea"
              rows={4}
            />
            <button type="submit" className="form-btn">
              Enviar Mensaje
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}