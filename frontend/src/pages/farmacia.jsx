// frontend/src/pages/farmacia.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/authContext';
import { useCart } from '../contexts/cartContext';
import '../styles/farmacia.css';

export default function Farmacia() {
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchWithAuth } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    setLoading(true);
    fetchWithAuth('/medicamentos/')
      .then(res => {
        setMedicamentos(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al cargar el catálogo de farmacia:', err);
        setError('No se pudo cargar el catálogo. Intenta de nuevo más tarde.');
        setLoading(false);
      });
  }, [fetchWithAuth]);

  if (loading) {
    return <div className="loading-spinner">Cargando medicamentos...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="farmacia-container">
      <h2>Catálogo de Farmacia</h2>
      <div className="farmacia-lista">
        {medicamentos.map(med => (
          <div className="med-card" key={med.id}>
            <h3>{med.nombre}</h3>
            <p>{med.descripcion}</p>
            <p>
              <strong>Precio:</strong> ${med.precio.toFixed(2)}
            </p>
            <p>
              <strong>Stock:</strong> {med.stock}
            </p>
            <button
              onClick={() => addToCart(med.id, 1)}
              disabled={med.stock === 0}
            >
              {med.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
