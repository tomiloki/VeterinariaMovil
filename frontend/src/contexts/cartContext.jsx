// src/contexts/cartContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './authContext';

export const CartContext = createContext();
const API_URL = import.meta.env.VITE_API_URL;

export const CartProvider = ({ children }) => {
  const { fetchWithAuth, logout } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cart')) || [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Persistir carrito en localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (medicamento, cantidad = 1) => {
    setCartItems(prev => {
      const exists = prev.find(item => item.medicamento === medicamento.id);
      if (exists) {
        return prev.map(item =>
          item.medicamento === medicamento.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      }
      return [
        ...prev,
        { medicamento: medicamento.id, nombre: medicamento.nombre, cantidad },
      ];
    });
  };

  const removeFromCart = medicamentoId => {
    setCartItems(prev =>
      prev.filter(item => item.medicamento !== medicamentoId)
    );
  };

  const clearCart = () => setCartItems([]);

  const submitOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await fetchWithAuth('/ordenes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            medicamento: item.medicamento,
            cantidad: item.cantidad,
          })),
        }),
      });
      clearCart();
      return data;
    } catch (err) {
      if (err.message.includes('Sesión expirada')) logout();
      else setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        submitOrder,
        loading,
        error,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context)
    throw new Error('useCart debe usarse dentro de CartProvider');
  return context;
};
