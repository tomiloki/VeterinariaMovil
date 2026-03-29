// frontend/src/components/carrito.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/cartContext';
import '../styles/carrito.css';

export default function Carrito() {
  const { cartItems, removeFromCart, clearCart, submitOrder, loading, error } = useCart();
  const navigate = useNavigate();

  const total = cartItems.reduce((sum, item) => sum + item.cantidad * item.precio, 0);

  useEffect(() => {
    if (!loading && !error && cartItems.length === 0) {
      // Opcional: navegar a éxito o mostrar mensaje tras compra
      // navigate('/reservar/exito');
    }
  }, [loading, error, cartItems, navigate]);

  const handleComprar = async () => {
    try {
      await submitOrder();
      clearCart();
      navigate('/reservar/exito');
    } catch {
      // El error ya está manejado en el contexto
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="carrito-container">
        <h2>Carrito</h2>
        <p>No hay productos en el carrito.</p>
      </div>
    );
  }

  return (
    <div className="carrito-container">
      <h2>Carrito</h2>
      {error && <div className="error-msg">{error}</div>}
      <ul className="carrito-list">
        {cartItems.map(item => (
          <li key={item.medicamento} className="carrito-item">
            <span>{item.nombre}</span>
            <span>x{item.cantidad}</span>
            <span>${(item.cantidad * item.precio).toFixed(2)}</span>
            <button onClick={() => removeFromCart(item.medicamento)} disabled={loading}>
              Eliminar
            </button>
          </li>
        ))}
      </ul>
      <p className="carrito-total">
        <strong>Total: ${total.toFixed(2)}</strong>
      </p>
      <button onClick={handleComprar} className="carrito-btn" disabled={loading}>
        {loading ? 'Procesando...' : 'Comprar'}
      </button>
    </div>
  );
}
