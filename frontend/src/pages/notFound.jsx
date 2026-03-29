import React from "react";
import { Link } from "react-router-dom";

import { BRAND_IMAGES } from "../data/imageLibrary";
import { useScrollReveal } from "../hooks/useScrollReveal";
import "../styles/notFound.css";

export default function NotFound() {
  useScrollReveal(".notfound-page .reveal-on-scroll");

  return (
    <main className="notfound-page" role="main" aria-labelledby="notfound-title">
      <article className="notfound-card page-shell reveal-on-scroll">
        <div className="notfound-visual">
          <img src={BRAND_IMAGES.gallery[2]} alt="Paciente veterinario en consulta" />
          <span>404</span>
        </div>

        <div className="notfound-content">
          <p>Ruta no disponible</p>
          <h1 id="notfound-title">La pagina que buscas no existe.</h1>
          <p className="notfound-copy">
            Puede que el enlace haya cambiado o que la direccion este incompleta. Volvamos al flujo principal.
          </p>
          <div className="notfound-actions">
            <Link to="/" className="btn-primary">
              Volver al inicio
            </Link>
            <Link to="/reservar" className="btn-ghost">
              Reservar consulta
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
