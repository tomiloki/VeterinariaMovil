import React from "react";
import { Link } from "react-router-dom";

import "../styles/footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <section className="footer-brand">
          <p className="footer-kicker">Mascota Feliz</p>
          <h3>Atencion veterinaria con criterio clinico y cercania humana.</h3>
          <p>
            Agenda online, equipo multidisciplinario y farmacia respaldada por profesionales para cuidar cada etapa de
            tu mascota.
          </p>
          <Link to="/reservar" className="btn-secondary footer-cta">
            Reservar consulta
          </Link>
        </section>

        <section className="footer-col">
          <h4>Navegacion</h4>
          <a href="/#servicios">Servicios</a>
          <a href="/#nosotros">Clinica</a>
          <a href="/#contacto">Contacto</a>
          <Link to="/farmacia">Farmacia</Link>
        </section>

        <section className="footer-col">
          <h4>Atencion</h4>
          <p>Urgencias: 24/7</p>
          <p>Telefono: +56 9 1234 5678</p>
          <p>Email: contacto@mascotafeliz.cl</p>
          <p>Av. Manquehue 440, Las Condes</p>
        </section>
      </div>

      <div className="footer-bottom">2026 Mascota Feliz. Clinica veterinaria y farmacia digital en una sola experiencia.</div>
    </footer>
  );
}
