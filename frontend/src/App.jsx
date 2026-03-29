import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./App.css";
import Footer from "./components/footer";
import Navbar from "./components/navbar";
import PrivateRoute from "./components/privateRoute";
import Carrito from "./components/carrito";
import ReservaCitaForm from "./components/reservaCitaForm";
import { AuthProvider } from "./contexts/authContext";
import { CartProvider } from "./contexts/cartContext";
import Farmacia from "./pages/farmacia";
import Home from "./pages/home";
import Login from "./pages/login";
import MascotaProfile from "./pages/mascotaProfile";
import NotFound from "./pages/notFound";
import PagoOrdenReturn from "./pages/pagoOrdenReturn";
import PagoReturn from "./pages/pagoReturn";
import Perfil from "./pages/perfil";
import ProductoDetalle from "./pages/productoDetalle";
import Register from "./pages/register";
import ReservaExito from "./pages/reservaExito";
import ReservaResumen from "./pages/reservaResumen";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="app-shell">
            <Navbar />
            <main className="main-content">
              <div className="app-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/reservar/confirmar" element={<ReservaResumen />} />
                  <Route path="/reservar/exito" element={<ReservaExito />} />
                  <Route path="/pago/exito" element={<PagoReturn />} />
                  <Route path="/pago/orden/exito" element={<PagoOrdenReturn />} />

                  <Route
                    path="/reservar"
                    element={
                      <PrivateRoute roles={["cliente"]}>
                        <ReservaCitaForm />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/mascota/:id"
                    element={
                      <PrivateRoute roles={["cliente", "veterinario", "admin"]}>
                        <MascotaProfile />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/farmacia"
                    element={
                      <PrivateRoute roles={["cliente", "admin"]}>
                        <Farmacia />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/farmacia/:id"
                    element={
                      <PrivateRoute roles={["cliente", "admin"]}>
                        <ProductoDetalle />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/carrito"
                    element={
                      <PrivateRoute roles={["cliente", "admin"]}>
                        <Carrito />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/perfil"
                    element={
                      <PrivateRoute roles={["cliente", "veterinario", "admin"]}>
                        <Perfil />
                      </PrivateRoute>
                    }
                  />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
