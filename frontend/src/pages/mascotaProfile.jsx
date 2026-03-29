import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useAuth } from "../contexts/auth-context";
import { BRAND_IMAGES } from "../data/imageLibrary";
import "../styles/mascotaProfile.css";

const TAB_CONFIG = [
  { key: "ficha", label: "Ficha clinica" },
  { key: "historial", label: "Historial" },
  { key: "vacunas", label: "Vacunas" },
  { key: "facturacion", label: "Facturacion" },
];

function serviceLabel(value) {
  if (value === "revision") return "Revision clinica";
  if (value === "aseo") return "Arreglos y aseo";
  if (value === "quirurgico") return "Intervenciones quirurgicas";
  return value || "-";
}

function petHeroImage(pet) {
  if (!pet) {
    return BRAND_IMAGES.gallery[0];
  }
  if (String(pet.especie).toLowerCase().includes("gato")) {
    return BRAND_IMAGES.gallery[1];
  }
  return BRAND_IMAGES.gallery[0];
}

export default function MascotaProfile() {
  const { id } = useParams();
  const { fetchWithAuth } = useAuth();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("ficha");

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetchWithAuth(`/mascotas/${id}/`)
      .then(({ data }) => {
        if (!mounted) {
          return;
        }
        setPet(data);
        setError(null);
      })
      .catch((requestError) => {
        if (!mounted) {
          return;
        }
        setError(requestError.message || "No se pudo cargar la informacion de la mascota.");
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [id, fetchWithAuth]);

  const tabs = useMemo(() => TAB_CONFIG, []);

  if (loading) {
    return <div className="loading-spinner">Cargando datos de la mascota...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!pet) {
    return <div className="empty-state">Mascota no encontrada.</div>;
  }

  return (
    <section className="mascota-page">
      <article className="mascota-hero">
        <img src={petHeroImage(pet)} alt={`Paciente ${pet.nombre}`} />
        <div className="mascota-hero-overlay" />
        <div className="mascota-hero-content">
          <p>Paciente activo</p>
          <h1>{pet.nombre}</h1>
          <span>
            {pet.especie} · {pet.raza || "Sin raza especificada"}
          </span>
        </div>
      </article>

      <article className="mascota-shell page-shell">
        <header className="mascota-header">
          <div className="mascota-summary">
            <div>
              <span>Edad</span>
              <strong>{pet.edad} anos</strong>
            </div>
            <div>
              <span>Peso</span>
              <strong>{pet.peso} kg</strong>
            </div>
            <div>
              <span>ID paciente</span>
              <strong>#{pet.id}</strong>
            </div>
          </div>

          <nav className="mascota-nav">
            <Link to="/">Inicio</Link>
            <Link to="/reservar">Reservas</Link>
            <Link to="/perfil">Perfil</Link>
          </nav>
        </header>

        <div className="tabs-row" role="tablist" aria-label="Secciones de mascota">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              className={activeTab === tab.key ? "tab active" : "tab"}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <section className="tab-panel">
          {activeTab === "ficha" && (
            <div className="panel-block">
              <h2>Observaciones clinicas</h2>
              <p>{pet.notasClinicas || "Aun no hay notas clinicas registradas para este paciente."}</p>
            </div>
          )}

          {activeTab === "historial" &&
            (pet.citas?.length > 0 ? (
              <ul>
                {pet.citas.map((cita) => (
                  <li key={cita.id}>
                    <strong>{new Date(cita.fecha).toLocaleString()}</strong>
                    <span>{serviceLabel(cita.subservicio)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay historial de citas por ahora.</p>
            ))}

          {activeTab === "vacunas" &&
            (pet.vacunas?.length > 0 ? (
              <ul>
                {pet.vacunas.map((vacuna) => (
                  <li key={vacuna.id}>
                    <strong>{vacuna.nombre}</strong>
                    <span>{new Date(vacuna.fecha).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay registro de vacunas cargado.</p>
            ))}

          {activeTab === "facturacion" &&
            (pet.facturas?.length > 0 ? (
              <ul>
                {pet.facturas.map((factura) => (
                  <li key={factura.id}>
                    <strong>Factura #{factura.id}</strong>
                    <span>${Number(factura.total).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay facturas asociadas a este paciente.</p>
            ))}
        </section>
      </article>
    </section>
  );
}
