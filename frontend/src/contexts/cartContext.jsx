import React, { useEffect, useMemo, useState } from "react";

import { useAuth } from "./auth-context";
import { CartContext } from "./cart-context";

function normalizeStoredCart(rawItems) {
  if (!Array.isArray(rawItems)) {
    return [];
  }

  return rawItems
    .map((item) => ({
      medicamento: Number(item.medicamento),
      nombre: item.nombre || "",
      cantidad: Math.max(1, Number(item.cantidad) || 1),
      precio: Math.max(0, Number(item.precio) || 0),
      stock: Math.max(0, Number(item.stock) || 0),
    }))
    .filter((item) => Number.isFinite(item.medicamento) && item.medicamento > 0);
}

function normalizeMedication(medicamento) {
  if (!medicamento?.id) {
    return null;
  }

  return {
    medicamento: Number(medicamento.id),
    nombre: medicamento.nombre || "Medicamento",
    precio: Math.max(0, Number(medicamento.precio) || 0),
    stock: Math.max(0, Number(medicamento.stock) || 0),
  };
}

export const CartProvider = ({ children }) => {
  const { fetchWithAuth, logout } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("cart"));
      return normalizeStoredCart(stored);
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.cantidad || 0), 0),
    [cartItems]
  );

  const addToCart = (medicamento, cantidad = 1) => {
    const normalized = normalizeMedication(medicamento);
    const requested = Math.max(1, Number(cantidad) || 1);

    if (!normalized) {
      setError("No se pudo agregar el medicamento al carrito.");
      return;
    }

    if (normalized.stock === 0) {
      setError("Este medicamento no tiene stock disponible.");
      return;
    }

    setError(null);
    setCartItems((prev) => {
      const existing = prev.find((item) => item.medicamento === normalized.medicamento);
      if (!existing) {
        return [
          ...prev,
          {
            ...normalized,
            cantidad: Math.min(requested, normalized.stock),
          },
        ];
      }

      const nextCantidad = existing.cantidad + requested;
      if (nextCantidad > normalized.stock) {
        setError(`Stock maximo alcanzado para ${normalized.nombre}.`);
        return prev;
      }

      return prev.map((item) =>
        item.medicamento === normalized.medicamento
          ? {
              ...item,
              cantidad: nextCantidad,
              precio: normalized.precio,
              stock: normalized.stock,
            }
          : item
      );
    });
  };

  const updateQuantity = (medicamentoId, nextCantidad) => {
    const parsedCantidad = Number(nextCantidad);
    if (!Number.isFinite(parsedCantidad) || parsedCantidad < 1) {
      setError("La cantidad minima es 1.");
      return;
    }

    setError(null);
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.medicamento !== medicamentoId) {
          return item;
        }

        if (item.stock > 0 && parsedCantidad > item.stock) {
          setError(`No hay suficiente stock para ${item.nombre}.`);
          return item;
        }

        return { ...item, cantidad: parsedCantidad };
      })
    );
  };

  const removeFromCart = (medicamentoId) => {
    setError(null);
    setCartItems((prev) => prev.filter((item) => item.medicamento !== medicamentoId));
  };

  const clearCart = () => {
    setError(null);
    setCartItems([]);
  };

  const submitOrder = async () => {
    if (cartItems.length === 0) {
      const emptyError = new Error("Tu carrito esta vacio.");
      setError(emptyError.message);
      throw emptyError;
    }

    setLoading(true);
    setError(null);
    try {
      const { data } = await fetchWithAuth("/ordenes/", {
        method: "POST",
        body: {
          items: cartItems.map((item) => ({
            medicamento: item.medicamento,
            cantidad: item.cantidad,
          })),
        },
      });
      clearCart();
      return data;
    } catch (requestError) {
      if (requestError.message.includes("Sesion expirada")) {
        logout();
      } else {
        setError(requestError.message);
      }
      throw requestError;
    } finally {
      setLoading(false);
    }
  };

  const startOrderPayment = async () => {
    const order = await submitOrder();
    setLoading(true);
    setError(null);

    try {
      const { data } = await fetchWithAuth("/pago/orden/", {
        method: "POST",
        body: { orden_id: order.id },
      });
      return { order, payment: data };
    } catch (requestError) {
      setError(requestError.message || "No se pudo iniciar el pago de la orden.");
      throw requestError;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        submitOrder,
        startOrderPayment,
        loading,
        error,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
