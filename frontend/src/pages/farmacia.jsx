import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useCart } from '../contexts/cartContext';
import '../styles/farmacia.css';

export default function Farmacia() {
  const [medicamentos, setMedicamentos] = useState([]);
  const { addItem } = useCart();

  useEffect(() => {
    api.get('medicamentos/').then(res => setMedicamentos(res.data));
  }, []);

  return (
    <div className="farmacia-container">
      <h2>Catálogo de Farmacia</h2>
      <div className="farmacia-lista">
        {medicamentos.map(med => (
          <div className="med-card" key={med.id}>
            <h3>{med.nombre}</h3>
            <p>{med.descripcion}</p>
            <p><b>Precio:</b> ${med.precio}</p>
            <p><b>Stock:</b> {med.stock}</p>
            <button onClick={() => addItem(med)}>
              Agregar al carrito
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}