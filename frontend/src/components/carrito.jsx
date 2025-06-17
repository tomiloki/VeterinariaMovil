import React from 'react';
import { useCart } from '../contexts/cartContext';
import api from '../services/api';
import '../styles/carrito.css';

export default function Carrito() {
  const { items, removeItem, clearCart } = useCart();

  const handleComprar = async () => {
    try {
      // Simulación de compra (ajusta los campos reales según tu backend)
      const payload = {
        cliente: 1, // ID del cliente, ajústalo si tienes login
        items: items.map(it => ({
          medicamento_id: it.id,
          cantidad: it.cantidad,
        })),
        total: items.reduce((sum, it) => sum + it.precio * it.cantidad, 0),
      };
      await api.post('ordenes/', payload);
      clearCart();
      alert('¡Compra realizada!');
    } catch {
      alert('Error al procesar la compra');
    }
  };

  return (
    <div className="carrito-container">
      <h2>Carrito</h2>
      {items.length === 0 ? (
        <p>No hay productos en el carrito.</p>
      ) : (
        <>
          <ul>
            {items.map(item => (
              <li key={item.id}>
                {item.nombre} x{item.cantidad} - ${item.precio * item.cantidad}
                <button onClick={() => removeItem(item.id)}>Eliminar</button>
              </li>
            ))}
          </ul>
          <p>
            <b>Total: ${items.reduce((sum, it) => sum + it.precio * it.cantidad, 0)}</b>
          </p>
          <button onClick={handleComprar}>Comprar</button>
        </>
      )}
    </div>
  );
}