// frontend/src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './contexts/authContext';
import { CartProvider } from './contexts/cartContext';

import Navbar from './components/navbar';
import Footer from './components/footer';
import PrivateRoute from './components/privateRoute';
import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/register';
import ReservaCitaForm from './components/reservaCitaForm';
import MascotaProfile from './pages/mascotaProfile';
import Farmacia from './pages/farmacia';
import Carrito from './components/carrito';
import ReservaResumen from './pages/reservaResumen';
import ReservaExito from './pages/reservaExito';
import NotFound from './pages/notFound';
import PagoReturn from './pages/pagoReturn';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <div className="container mx-auto p-4">
            <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reservar/confirmar" element={<ReservaResumen />} />
              <Route path="/reservar/exito" element={<ReservaExito />} />
              <Route path="/pago/exito" element={<PagoReturn />} />

              {/* Rutas protegidas con roles */}
              <Route
                path="/reservar"
                element={
                  <PrivateRoute roles={[ 'cliente' ]}>
                    <ReservaCitaForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/mascota/:id"
                element={
                  <PrivateRoute roles={[ 'cliente', 'veterinario', 'admin' ]}>
                    <MascotaProfile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/farmacia"
                element={
                  <PrivateRoute roles={[ 'cliente', 'admin' ]}>
                    <Farmacia />
                  </PrivateRoute>
                }
              />
              <Route
                path="/carrito"
                element={
                  <PrivateRoute roles={[ 'cliente', 'admin' ]}>
                    <Carrito />
                  </PrivateRoute>
                }
              />

              {/* Página no encontrada */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
