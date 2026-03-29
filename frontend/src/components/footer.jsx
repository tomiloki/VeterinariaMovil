import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      {/* Top Section */}
      <div className="footer-top container mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Company Info */}
        <div className="footer-col">
          <div className="logo">Mascota Feliz</div>
          <p className="footer-desc">
            Encuentra tu Mascota Feliz más cercano. Te esperamos de lunes a domingo con atención presencial y móvil. Agenda con anticipación y evita aglomeraciones.
          </p>
          <div className="socials">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon">📘</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon">📸</a>
          </div>
        </div>

        {/* Links */}
        <div className="footer-col">
          <h4 className="footer-heading">Empresa</h4>
          <ul className="footer-links">
            <li><a href="#nosotros" className="footer-link">Nosotros</a></li>
            <li><a href="#servicios" className="footer-link">Servicios</a></li>
            <li><a href="#contacto" className="footer-link">Contacto</a></li>
            <li><Link to="/reservar" className="footer-link">Reservar Cita</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-col">
          <h4 className="footer-heading">Contáctanos</h4>
          <ul className="contact-info">
            <li>
              <span className="contact-label">Dirección:</span>
              Avenida Ejemplo 123, Santiago, Chile
            </li>
            <li>
              <span className="contact-label">Whatsapp:</span>
              <a href="https://wa.me/56912345678" className="footer-link">+56 9 1234 5678</a>
            </li>
            <li>
              <span className="contact-label">Email:</span>
              <a href="mailto:contacto@mascotafeliz.cl" className="footer-link">contacto@mascotafeliz.cl</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container mx-auto px-6 text-center">
          <p>© 2025 Mascota Feliz. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
