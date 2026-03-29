import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCart } from "../contexts/cart-context";
import { useScrollReveal } from "../hooks/useScrollReveal";
import "../styles/carrito.css";

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function estimatedDeliveryLabel() {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return new Intl.DateTimeFormat("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export default function Carrito() {
  const { cartItems, updateQuantity, removeFromCart, submitOrder, startOrderPayment, loading, error } = useCart();
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useScrollReveal(".carrito-page .reveal-on-scroll", `${cartItems.length}-${Boolean(successMessage)}-${Boolean(error)}`);

  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.cantidad * Number(item.precio), 0),
    [cartItems]
  );
  const itemCount = useMemo(() => cartItems.reduce((sum, item) => sum + Number(item.cantidad || 0), 0), [cartItems]);

  const handleComprar = async () => {
    try {
      const order = await submitOrder();
      setSuccessMessage(`Orden #${order.id} creada correctamente.`);
    } catch {
      setSuccessMessage("");
    }
  };

  const handlePagarWebpay = async () => {
    try {
      const { payment } = await startOrderPayment();
      const urlPago = payment.url_pago || payment.url;
      const token = payment.token;
      if (!urlPago || !token) {
        throw new Error("No fue posible iniciar el pago de la orden.");
      }

      const form = document.createElement("form");
      form.method = "POST";
      form.action = urlPago;
      form.style.display = "none";

      const tokenInput = document.createElement("input");
      tokenInput.type = "hidden";
      tokenInput.name = "token_ws";
      tokenInput.value = token;
      form.appendChild(tokenInput);

      document.body.appendChild(form);
      form.submit();
    } catch {
      setSuccessMessage("");
    }
  };

  return (
    <section className="carrito-page page-shell">
      <header className="carrito-header reveal-on-scroll" data-delay="1">
        <div>
          <h1>Tu carrito veterinario</h1>
          <p>Revisa dosis, cantidades y finaliza tu compra con pago seguro en Webpay.</p>
        </div>
        <button type="button" className="btn-ghost" onClick={() => navigate("/farmacia")}>
          Seguir comprando
        </button>
      </header>

      {error && <div className="error-message reveal-on-scroll is-visible">{error}</div>}
      {successMessage && <div className="carrito-success reveal-on-scroll is-visible">{successMessage}</div>}

      {cartItems.length === 0 ? (
        <div className="empty-state reveal-on-scroll is-visible">Tu carrito esta vacio. Agrega productos desde farmacia.</div>
      ) : (
        <div className="carrito-layout reveal-on-scroll" data-delay="1">
          <div className="carrito-items-panel reveal-on-scroll" data-delay="1">
            <ul className="carrito-list">
              {cartItems.map((item, index) => (
                <li key={item.medicamento} className="carrito-item reveal-on-scroll" data-delay={index % 3}>
                  <div className="item-main">
                    <h3>{item.nombre}</h3>
                    <p>{formatCurrency(item.precio)} c/u</p>
                  </div>

                  <div className="item-controls">
                    <label htmlFor={`qty-${item.medicamento}`}>Cantidad</label>
                    <input
                      id={`qty-${item.medicamento}`}
                      type="number"
                      min="1"
                      max={item.stock > 0 ? item.stock : undefined}
                      value={item.cantidad}
                      onChange={(event) => updateQuantity(item.medicamento, event.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="item-subtotal">{formatCurrency(item.cantidad * Number(item.precio))}</div>

                  <button
                    type="button"
                    className="btn-ghost item-remove"
                    onClick={() => removeFromCart(item.medicamento)}
                    disabled={loading}
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <aside className="carrito-summary-card reveal-on-scroll" data-delay="2">
            <h2>Resumen de compra</h2>
            <dl>
              <div>
                <dt>Productos</dt>
                <dd>{itemCount}</dd>
              </div>
              <div>
                <dt>Subtotal</dt>
                <dd>{formatCurrency(total)}</dd>
              </div>
              <div>
                <dt>Despacho</dt>
                <dd>Gratis</dd>
              </div>
              <div className="total-row">
                <dt>Total</dt>
                <dd>{formatCurrency(total)}</dd>
              </div>
            </dl>

            <p className="delivery-note">Entrega estimada: {estimatedDeliveryLabel()}</p>

            <div className="trust-badges">
              <span>Pago protegido</span>
              <span>Seguimiento de orden</span>
              <span>Soporte veterinario</span>
            </div>

            <div className="carrito-footer-actions">
              <button type="button" className="btn-ghost" onClick={handleComprar} disabled={loading}>
                {loading ? "Procesando..." : "Generar orden"}
              </button>
              <button type="button" className="btn-primary" onClick={handlePagarWebpay} disabled={loading}>
                {loading ? "Procesando..." : "Pagar con Webpay"}
              </button>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
