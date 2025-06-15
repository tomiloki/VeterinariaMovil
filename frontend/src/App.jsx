// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ReservaCitaForm from './components/reservaCitaForm';
import MascotaProfile from './pages/mascotaProfile';
import Home from './pages/home'
import Navbar from './components/navbar'
import Footer from './components/footer';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mascota/:id" element={<MascotaProfile />} />
          <Route path="/reservar" element={<ReservaCitaForm />} />
        </Routes>
        <Footer />
      </div>
      
    </BrowserRouter>
  );
}