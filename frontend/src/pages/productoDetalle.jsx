import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../contexts/auth-context";
import { useCart } from "../contexts/cart-context";
import { getProductImage } from "../data/imageLibrary";
import { categorizeMedication } from "../data/pharmacyInsights";
import { useScrollReveal } from "../hooks/useScrollReveal";
import "../styles/productoDetalle.css";

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function normalizeList(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }
  return Array.isArray(payload?.results) ? payload.results : [];
}

export default function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchWithAuth } = useAuth();
  const { addToCart } = useCart();

  const [producto, setProducto] = useState(null);
  const [catalogo, setCatalogo] = useState([]);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([fetchWithAuth(`/medicamentos/${id}/`), fetchWithAuth("/medicamentos/")])
      .then(([productoResponse, catalogoResponse]) => {
        if (!mounted) {
          return;
        }
        setProducto(productoResponse.data);
        setCatalogo(normalizeList(catalogoResponse.data));
        setError(null);
      })
      .catch((requestError) => {
        if (!mounted) {
          return;
        }
        setError(requestError.message || "No se pudo cargar el producto.");
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [fetchWithAuth, id]);

  const categoryInfo = useMemo(() => (producto ? categorizeMedication(producto) : null), [producto]);

  const relatedProducts = useMemo(() => {
    if (!producto) {
      return [];
    }

    const currentCategory = categorizeMedication(producto).key;
    return catalogo
      .filter((item) => Number(item.id) !== Number(producto.id))
      .map((item) => ({ ...item, category: categorizeMedication(item) }))
      .sort((a, b) => {
        const aScore = (a.category.key === currentCategory ? 2 : 0) + (Number(a.stock) > 0 ? 1 : 0);
        const bScore = (b.category.key === currentCategory ? 2 : 0) + (Number(b.stock) > 0 ? 1 : 0);
        return bScore - aScore;
      })
      .slice(0, 3);
  }, [catalogo, producto]);

  useScrollReveal(".producto-wrapper .reveal-on-scroll", String(relatedProducts.length));

  if (loading) {
    return <div className="loading-spinner">Cargando ficha del producto...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!producto) {
    return <div className="empty-state">Producto no encontrado.</div>;
  }

  const maxQty = Math.max(1, Number(producto.stock) || 1);

  return (
    <section className="producto-wrapper">
      <div className="producto-page page-shell reveal-on-scroll">
        <div className="producto-image-wrap">
          <img src={getProductImage(producto)} alt={producto.nombre} />
        </div>

        <div className="producto-content">
          <Link to="/farmacia" className="producto-back">
            Volver a farmacia
          </Link>

          <span className={`med-category ${categoryInfo?.key || "general"}`}>{categoryInfo?.label || "General"}</span>
          <h1>{producto.nombre}</h1>
          <p className="producto-desc">{producto.descripcion || "Sin descripcion disponible."}</p>
          {categoryInfo?.description && <p className="producto-description-extra">{categoryInfo.description}</p>}

          <div className="producto-meta">
            <div>
              <span>Precio</span>
              <strong>{formatCurrency(producto.precio)}</strong>
            </div>
            <div>
              <span>Stock</span>
              <strong>{producto.stock}</strong>
            </div>
          </div>

          <div className="producto-trust">
            <span>Despacho programado en 24-48h</span>
            <span>Orientacion veterinaria post compra</span>
            <span>Pago protegido con Webpay</span>
          </div>

          <div className="producto-qty">
            <label htmlFor="cantidad-producto">Cantidad</label>
            <input
              id="cantidad-producto"
              type="number"
              min="1"
              max={maxQty}
              value={cantidad}
              onChange={(event) => setCantidad(Math.min(maxQty, Math.max(1, Number(event.target.value) || 1)))}
            />
          </div>

          <div className="producto-actions">
            <button
              type="button"
              className="btn-secondary"
              disabled={Number(producto.stock) === 0}
              onClick={() => {
                addToCart(producto, cantidad);
                setNotice("Producto agregado al carrito.");
                setTimeout(() => setNotice(""), 1400);
              }}
            >
              {Number(producto.stock) === 0 ? "Sin stock" : "Agregar al carrito"}
            </button>
            <button type="button" className="btn-primary" onClick={() => navigate("/carrito")}>
              Comprar ahora
            </button>
          </div>

          {notice && <p className="producto-notice">{notice}</p>}

          <section className="producto-clinical">
            <h2>Uso clinico recomendado</h2>
            <ul>
              {(categoryInfo?.highlights || []).map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            {categoryInfo?.advice && <p className="producto-advice">{categoryInfo.advice}</p>}
          </section>
        </div>
      </div>

      <section className="producto-relacionados page-shell reveal-on-scroll" data-delay="1">
        <h2>Productos relacionados</h2>
        {relatedProducts.length === 0 ? (
          <p className="empty-state">No hay recomendaciones disponibles por ahora.</p>
        ) : (
          <div className="producto-rel-grid">
            {relatedProducts.map((item, index) => (
              <article key={item.id} className="producto-rel-card reveal-on-scroll" data-delay={index % 3}>
                <img src={getProductImage(item)} alt={item.nombre} loading="lazy" />
                <div>
                  <h3>{item.nombre}</h3>
                  <p>{item.category.label}</p>
                  <strong>{formatCurrency(item.precio)}</strong>
                </div>
                <div className="producto-rel-actions">
                  <Link to={`/farmacia/${item.id}`} className="btn-ghost">
                    Ver
                  </Link>
                  <button type="button" className="btn-secondary" onClick={() => addToCart(item, 1)}>
                    Agregar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
