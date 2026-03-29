import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/auth-context";
import { useCart } from "../contexts/cart-context";
import { BRAND_IMAGES, getProductImage } from "../data/imageLibrary";
import { CATEGORY_DEFS, FALLBACK_CATEGORY, categorizeMedication } from "../data/pharmacyInsights";
import { useScrollReveal } from "../hooks/useScrollReveal";
import "../styles/farmacia.css";

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export default function Farmacia() {
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todas");
  const { fetchWithAuth } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetchWithAuth("/medicamentos/")
      .then(({ data }) => {
        if (!mounted) {
          return;
        }
        setMedicamentos(Array.isArray(data?.results) ? data.results : data);
        setError(null);
      })
      .catch((requestError) => {
        if (!mounted) {
          return;
        }
        setError(requestError.message || "No se pudo cargar el catalogo.");
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [fetchWithAuth]);

  const catalog = useMemo(
    () =>
      medicamentos.map((medication) => ({
        ...medication,
        category: categorizeMedication(medication),
      })),
    [medicamentos]
  );

  const categoryCounters = useMemo(() => {
    const counters = {};
    for (const med of catalog) {
      counters[med.category.key] = (counters[med.category.key] || 0) + 1;
    }
    return counters;
  }, [catalog]);

  const categories = useMemo(() => {
    const dynamicCategories = CATEGORY_DEFS.filter((category) => categoryCounters[category.key] > 0).map((category) => ({
      key: category.key,
      label: category.label,
      count: categoryCounters[category.key],
    }));

    if (categoryCounters[FALLBACK_CATEGORY.key]) {
      dynamicCategories.push({
        key: FALLBACK_CATEGORY.key,
        label: FALLBACK_CATEGORY.label,
        count: categoryCounters[FALLBACK_CATEGORY.key],
      });
    }

    return [{ key: "todas", label: "Todas", count: catalog.length }, ...dynamicCategories];
  }, [catalog.length, categoryCounters]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return catalog.filter((med) => {
      const matchesCategory = selectedCategory === "todas" || med.category.key === selectedCategory;
      const matchesSearch =
        normalizedQuery.length === 0 ||
        med.nombre?.toLowerCase().includes(normalizedQuery) ||
        med.descripcion?.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [catalog, query, selectedCategory]);

  const metrics = useMemo(() => {
    const available = catalog.filter((med) => Number(med.stock) > 0).length;
    const out = catalog.length - available;
    return {
      total: catalog.length,
      available,
      out,
    };
  }, [catalog]);

  useScrollReveal(
    ".farmacia-page .reveal-on-scroll",
    `${loading}-${filtered.length}-${selectedCategory}-${query}`
  );

  const handleAdd = (medicamento) => {
    addToCart(medicamento, 1);
    setNotice(`${medicamento.nombre} agregado al carrito.`);
    setTimeout(() => setNotice(""), 1800);
  };

  if (loading) {
    return <div className="loading-spinner">Cargando catalogo de farmacia...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="farmacia-page">
      <section className="farmacia-hero reveal-on-scroll">
        <img src={BRAND_IMAGES.services.farmacia} alt="Farmacia veterinaria con atencion profesional" />
        <div className="farmacia-hero-overlay" />
        <div className="farmacia-hero-content">
          <p>Farmacia clinica Mascota Feliz</p>
          <h1>Tratamientos y cuidado diario con respaldo veterinario.</h1>
          <span>Despacho programado + pago seguro Webpay + seguimiento de orden</span>
        </div>
      </section>

      <section className="farmacia-toolbar page-shell reveal-on-scroll" data-delay="1">
        <div>
          <h2>Catalogo de productos</h2>
          <p>Filtra por categoria terapeutica y encuentra rapidamente lo que tu mascota necesita.</p>
        </div>
        <div className="farmacia-actions">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por producto o indicacion"
            className="farmacia-search"
          />
          <button type="button" className="btn-primary" onClick={() => navigate("/carrito")}>
            Ver carrito
          </button>
        </div>
      </section>

      <section className="farmacia-metrics reveal-on-scroll" data-delay="1">
        <article>
          <span>Productos activos</span>
          <strong>{metrics.total}</strong>
        </article>
        <article>
          <span>Disponibles</span>
          <strong>{metrics.available}</strong>
        </article>
        <article>
          <span>Sin stock</span>
          <strong>{metrics.out}</strong>
        </article>
      </section>

      <section className="farmacia-categories reveal-on-scroll" data-delay="1" aria-label="Categorias de productos">
        {categories.map((category) => (
          <button
            key={category.key}
            type="button"
            className={selectedCategory === category.key ? "category-chip active" : "category-chip"}
            onClick={() => setSelectedCategory(category.key)}
          >
            {category.label} ({category.count})
          </button>
        ))}
      </section>

      {notice && (
        <div className="farmacia-notice reveal-on-scroll is-visible" data-delay="1">
          {notice}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state reveal-on-scroll is-visible">No encontramos productos para ese criterio de busqueda.</div>
      ) : (
        <div className="farmacia-grid">
          {filtered.map((med, index) => (
            <article className="med-card reveal-on-scroll" data-delay={index % 3} key={med.id}>
              <img src={getProductImage(med)} alt={med.nombre} className="med-card-image" loading="lazy" />
              <div className="med-card-content">
                <span className={`med-category ${med.category.key}`}>{med.category.label}</span>
                <h3>{med.nombre}</h3>
                <p>{med.descripcion || "Sin descripcion"}</p>
              </div>

              <div className="med-card-footer">
                <div>
                  <p className="price-label">Precio</p>
                  <p className="price-value">{formatCurrency(med.precio)}</p>
                </div>
                <p className={`stock ${med.stock > 0 ? "in" : "out"}`}>
                  {med.stock > 0 ? `Stock: ${med.stock}` : "Sin stock"}
                </p>
              </div>

              <div className="med-card-actions">
                <Link to={`/farmacia/${med.id}`} className="btn-ghost med-detail-btn">
                  Ver detalle
                </Link>
                <button type="button" className="btn-secondary" onClick={() => handleAdd(med)} disabled={med.stock === 0}>
                  {med.stock === 0 ? "Agotado" : "Agregar"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
