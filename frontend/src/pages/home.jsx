import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import ReservationDropdown from "../components/reservationDropdown";
import { BRAND_IMAGES } from "../data/imageLibrary";
import { useScrollReveal } from "../hooks/useScrollReveal";
import "../styles/home.css";

const services = [
  {
    title: "Consulta preventiva",
    desc: "Chequeo integral, vacunacion, control de crecimiento y seguimiento clinico por etapa.",
    link: "/reservar?tipo=presencial",
    image: BRAND_IMAGES.services.consulta,
  },
  {
    title: "Urgencias y procedimientos",
    desc: "Evaluacion inmediata, estabilizacion, curaciones y cirugia menor con protocolos de seguridad.",
    link: "/reservar?tipo=presencial",
    image: BRAND_IMAGES.services.procedimiento,
  },
  {
    title: "Veterinaria movil",
    desc: "Visitas programadas para pacientes sensibles al traslado, recuperaciones y controles en casa.",
    link: "/reservar?tipo=movil",
    image: BRAND_IMAGES.services.movil,
  },
  {
    title: "Farmacia clinica",
    desc: "Medicamentos y cuidado diario con orientacion profesional y pago seguro Webpay.",
    link: "/farmacia",
    image: BRAND_IMAGES.services.farmacia,
  },
];

const steps = [
  {
    title: "Reserva simple",
    desc: "Elige fecha y modalidad en minutos desde cualquier dispositivo.",
  },
  {
    title: "Atencion clara",
    desc: "Recibes diagnostico, plan de manejo y seguimiento con lenguaje entendible.",
  },
  {
    title: "Continuidad real",
    desc: "Desde la consulta a la farmacia: todo conectado en un mismo flujo.",
  },
];

const testimonials = [
  {
    name: "Camila A. - tutora de Luna",
    quote: "Nos explicaron cada paso y salimos con un plan super claro. Se nota el nivel del equipo.",
    image: BRAND_IMAGES.testimonials[0],
  },
  {
    name: "Matias R. - tutor de Kira",
    quote: "Excelente atencion de urgencia, rapida y muy humana. De verdad nos dieron tranquilidad.",
    image: BRAND_IMAGES.testimonials[1],
  },
  {
    name: "Javiera P. - tutora de Max",
    quote: "Compramos tratamiento y coordinamos control en la misma plataforma. Muy comodo.",
    image: BRAND_IMAGES.testimonials[2],
  },
];

const clinicalPillars = [
  {
    badge: "Chequeo preventivo",
    title: "Medicina interna y bienestar integral",
    desc: "Evaluamos nutricion, piel, digestivo y salud general para detectar riesgos antes de que evolucionen.",
    image: BRAND_IMAGES.team[0],
  },
  {
    badge: "Cirugia segura",
    title: "Protocolos quirurgicos y recuperacion controlada",
    desc: "Monitoreo perioperatorio, analgesia multimodal y pautas de cuidados para volver a casa con claridad.",
    image: BRAND_IMAGES.team[1],
  },
  {
    badge: "Acompanamiento tutor",
    title: "Comunicacion clinica simple y constante",
    desc: "Cada caso incluye explicacion de opciones, costos estimados y seguimiento para que no avances con dudas.",
    image: BRAND_IMAGES.team[2],
  },
];

export default function Home() {
  const [open, setOpen] = useState(false);
  const { hash } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hash) {
      return;
    }

    const target = document.querySelector(hash);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [hash]);

  useScrollReveal(".home-page .reveal-on-scroll");

  const handleTipoSelect = (tipo) => {
    setOpen(false);
    navigate(`/reservar?tipo=${tipo}`);
  };

  return (
    <div className="home-page">
      <section className="hero" id="hero">
        <img src={BRAND_IMAGES.hero} alt="Veterinaria en consulta con tutora y mascota" className="hero-image" />
        <div className="hero-overlay" />
        <div className="hero-inner">
          <p className="hero-kicker">Clinica veterinaria moderna en Santiago</p>
          <h1>Mascota Feliz</h1>
          <h2>Cuidado experto, cercano y sin friccion para tu mascota.</h2>
          <p>
            Agenda citas, sigue indicaciones clinicas y compra en farmacia desde una experiencia pensada para tutores
            reales.
          </p>
          <div className="hero-actions">
            <button type="button" className="btn-secondary" onClick={() => setOpen((value) => !value)}>
              Reservar consulta
            </button>
            <NavLink to="/farmacia" className="btn-ghost hero-shop">
              Ir a farmacia
            </NavLink>
            {open && <ReservationDropdown onSelect={handleTipoSelect} onClose={() => setOpen(false)} />}
          </div>
          <div className="hero-meta">
            <span>Urgencias 24/7</span>
            <span>Equipo clinico multidisciplinario</span>
            <span>Pago seguro con Webpay</span>
          </div>
        </div>
      </section>

      <section className="trust-rail reveal-on-scroll" data-delay="1" aria-label="Respaldo de servicio">
        <p>Horario extendido 7 dias</p>
        <p>Atencion presencial y movil</p>
        <p>Seguimiento post consulta</p>
        <p>Farmacia integrada</p>
      </section>

      <section id="servicios" className="services-section reveal-on-scroll" data-delay="1">
        <div className="section-head">
          <p className="section-kicker">Servicios</p>
          <h3>Una clinica pensada para resolver todo en el mismo lugar</h3>
        </div>
        <div className="services-grid">
          {services.map((item, index) => (
            <NavLink to={item.link} key={item.title} className="service-item reveal-on-scroll" data-delay={index % 3}>
              <img src={item.image} alt={item.title} loading="lazy" />
              <div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            </NavLink>
          ))}
        </div>
      </section>

      <section id="nosotros" className="about-section page-shell reveal-on-scroll">
        <div className="about-copy">
          <p className="section-kicker">Metodo clinico</p>
          <h3>Combinamos medicina basada en evidencia con una experiencia humana para tutores.</h3>
          <p>
            Inspirados en clinicas de referencia internacional, trabajamos con protocolos de triage, comunicacion clara
            y continuidad real entre consulta, tratamiento y control.
          </p>
        </div>
        <div className="about-steps">
          {steps.map((step, index) => (
            <article key={step.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h4>{step.title}</h4>
              <p>{step.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="gallery-section reveal-on-scroll" data-delay="1">
        <div className="gallery-visuals">
          <figure className="gallery-main">
            <img src={BRAND_IMAGES.gallery[0]} alt="Veterinaria atendiendo paciente" loading="lazy" />
            <figcaption>Evaluacion inicial y triage para priorizar cada caso de forma segura.</figcaption>
          </figure>
          <div className="gallery-stack">
            <figure>
              <img src={BRAND_IMAGES.gallery[1]} alt="Control clinico veterinario" loading="lazy" />
              <figcaption>Controles periodicos con seguimiento personalizado.</figcaption>
            </figure>
            <figure>
              <img src={BRAND_IMAGES.gallery[2]} alt="Paciente en revision veterinaria" loading="lazy" />
              <figcaption>Comunicacion clara con tutores durante todo el tratamiento.</figcaption>
            </figure>
          </div>
        </div>
        <article className="gallery-copy page-shell">
          <p className="section-kicker">Atencion en terreno real</p>
          <h3>Un entorno clinico calmado, protocolos estrictos y foco total en bienestar.</h3>
          <p>
            En cada consulta cuidamos la experiencia completa: desde la recepcion y evaluacion inicial hasta la
            indicacion de tratamiento y el seguimiento posterior.
          </p>
          <ul>
            <li>Triage y priorizacion de urgencias.</li>
            <li>Registro clinico ordenado para continuidad de cuidado.</li>
            <li>Acompanamiento al tutor en decisiones de salud.</li>
          </ul>
          <NavLink to="/reservar" className="btn-primary">
            Quiero reservar una consulta
          </NavLink>
        </article>
      </section>

      <section className="team-section reveal-on-scroll" data-delay="1" aria-label="Equipo clinico">
        <div className="section-head">
          <p className="section-kicker">Equipo clinico</p>
          <h3>Especialistas que combinan rigor medico con acompanamiento cercano</h3>
        </div>
        <div className="team-grid">
          {clinicalPillars.map((pillar, index) => (
            <article key={pillar.title} className="team-card reveal-on-scroll" data-delay={index % 3}>
              <img src={pillar.image} alt={pillar.title} loading="lazy" />
              <div className="team-card-copy">
                <p className="team-badge">{pillar.badge}</p>
                <h4>{pillar.title}</h4>
                <p>{pillar.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="care-points reveal-on-scroll" data-delay="1" aria-label="Compromisos de atencion">
        <article>
          <h4>Respuesta rapida</h4>
          <p>Coordinamos atenciones y confirmaciones en tiempos acotados para que no pierdas continuidad.</p>
        </article>
        <article>
          <h4>Criterio medico</h4>
          <p>Indicaciones basadas en evidencia, explicadas en lenguaje simple para decisiones informadas.</p>
        </article>
        <article>
          <h4>Seguimiento real</h4>
          <p>No termina en la consulta: acompanamos controles, tratamientos y compras de farmacia.</p>
        </article>
      </section>

      <section className="testimonials-section page-shell reveal-on-scroll">
        <div className="section-head">
          <p className="section-kicker">Experiencias</p>
          <h3>Lo que valoran quienes ya atienden con nosotros</h3>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((item, index) => (
            <article key={item.name} className="testimonial reveal-on-scroll" data-delay={index % 3}>
              <img src={item.image} alt={item.name} loading="lazy" />
              <blockquote>{item.quote}</blockquote>
              <p>{item.name}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="contacto" className="contact-section reveal-on-scroll">
        <div className="contact-copy">
          <p className="section-kicker">Contacto</p>
          <h3>Agenda una primera consulta y empecemos el plan de salud de tu mascota.</h3>
          <p>Telefono: +56 9 1234 5678</p>
          <p>Email: contacto@mascotafeliz.cl</p>
          <p>Direccion: Av. Manquehue 440, Las Condes</p>
          <p>Horario clinico: Lunes a Domingo, 09:00 - 22:00</p>
        </div>
        <form className="contact-form page-shell" onSubmit={(event) => event.preventDefault()}>
          <input type="text" placeholder="Nombre del tutor" className="form-input" />
          <input type="email" placeholder="Correo de contacto" className="form-input" />
          <textarea placeholder="Cuentanos que necesita tu mascota" className="form-textarea" rows={4} />
          <button type="submit" className="btn-primary">
            Solicitar llamada
          </button>
        </form>
      </section>
    </div>
  );
}
