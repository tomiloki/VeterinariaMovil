import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import ReservationDropdown from '../components/reservationDropdown';
import '../styles/home.css';

export default function Home() {
  const [open, setOpen] = useState(false);
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [hash]);

  const toggleDropdown = () => setOpen(prev => !prev);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero" id="hero">
        <div className="content">
          <h1 className="title">Bienvenido a Mascota Feliz</h1>
          <p className="subtitle">Cuidamos a tu mejor amigo con pasión y profesionalismo.</p>
          <div className="reservation-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
            <button className="btn" onClick={toggleDropdown}>Reserva una Cita Ahora</button>
            {open && <ReservationDropdown onClose={() => setOpen(false)} />}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="services-section container mx-auto px-6 py-16">
        <h3 className="section-title">Nuestros Servicios</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: 'Citas Presenciales', desc: 'Atención en nuestra clínica con los mejores profesionales.', link: '/reservar?tipo=presencial' },
            { title: 'Veterinaria Móvil', desc: 'Llevamos el consultorio a tu hogar con insumos y medicamentos.', link: '/reservar?tipo=movil' },
            { title: 'Farmacia Online', desc: 'Compra productos y medicamentos con entrega rápida.', link: '/farmacia' },
          ].map(item => (
            <div key={item.title} className="service-card">
              <div className="icon-wrapper"><span className="icon">🐾</span></div>
              <h4 className="card-title">{item.title}</h4>
              <p className="card-desc">{item.desc}</p>
              <NavLink to={item.link} className="card-link">Ver más</NavLink>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="nosotros" className="about-section">
        <div className="container mx-auto px-6 py-16">
          <h3 className="section-title">Sobre Nosotros</h3>
          <p className="about-text">
            En Mascota Feliz ofrecemos atención veterinaria integral: consultas, cirugías menores y seguimiento posterior. Nuestra unidad móvil está equipada para llevar el consultorio directamente a tu hogar.
          </p>
          <ul className="about-list">
            <li>✅ Equipo de veterinarios certificados.</li>
            <li>✅ Atención a domicilio y en clínica.</li>
            <li>✅ Farmacia con entrega en 24 horas.</li>
            <li>✅ Agenda online fácil y rápida.</li>
          </ul>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="contact-section container mx-auto px-6 py-16">
        <h3 className="section-title">Contáctanos</h3>
        <div className="flex flex-col md:flex-row md:space-x-8">
          <div className="contact-info md:w-1/2 mb-6 md:mb-0">
            <p className="contact-text">Escríbenos para cualquier duda o para reservar tu cita móvil.</p>
            <ul className="contact-list">
              <li>📞 Teléfono: +56 9 1234 5678</li>
              <li>✉ Email: contacto@mascotafeliz.cl</li>
              <li>📍 Dirección: Av. Ejemplo 123, Santiago, Chile</li>
            </ul>
          </div>
          <div className="contact-form md:w-1/2">
            <form className="form-fields">
              <input type="text" placeholder="Tu nombre" className="form-input" />
              <input type="email" placeholder="Tu correo" className="form-input" />
              <textarea placeholder="Mensaje" className="form-textarea" rows={4} />
              <button type="submit" className="form-btn">Enviar Mensaje</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}