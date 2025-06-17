import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = (medicamento) => {
    setItems(prev =>
      prev.some(item => item.id === medicamento.id)
        ? prev.map(item =>
            item.id === medicamento.id
              ? { ...item, cantidad: item.cantidad + 1 }
              : item
          )
        : [...prev, { ...medicamento, cantidad: 1 }]
    );
  };

  const removeItem = (id) => setItems(prev => prev.filter(item => item.id !== id));

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}