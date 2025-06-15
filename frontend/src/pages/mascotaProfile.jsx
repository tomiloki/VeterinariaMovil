import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function MascotaProfile() {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [activeTab, setActiveTab] = useState('ficha');

  useEffect(() => {
    api.get(`mascotas/${id}/`)
      .then(({ data }) => {
        setPet({
          ...data,
          upcomingAppointments: [],
          medicalRecords: [],
          vaccines: [],
          invoices: [],
        });
      })
      .catch(() => setPet(null));
  }, [id]);

  if (!pet) return <div className="text-center p-8">Cargando datos de la mascota...</div>;

  const tabs = [
    { key: 'ficha', label: 'Ficha Clínica' },
    { key: 'historial', label: 'Historial de Citas' },
    { key: 'vacunas', label: 'Vacunas' },
    { key: 'facturacion', label: 'Facturación' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Mascota Feliz</h1>
          <nav className="space-x-4">
            <Link to="/" className="hover:underline">Home</Link>
            <Link to="/servicios" className="hover:underline">Servicios</Link>
            <Link to="/mascotas" className="hover:underline">Mis Mascotas</Link>
            <Link to="/perfil" className="hover:underline">Mi Perfil</Link>
          </nav>
        </div>
      </header>

      {/* Main Profile Card */}
      <main className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-6">
            <img
              src="/placeholder-pet.jpg"
              alt="Foto mascota"
              className="w-32 h-32 object-cover rounded-full"
            />
            <div>
              <h2 className="text-3xl font-bold mb-1">{pet.nombre}</h2>
              <p className="text-gray-600">{pet.especie} - {pet.raza || 'Sin especificar'}</p>
              <p className="text-gray-600">Edad: {pet.edad} años</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b">
            <nav className="-mb-px flex space-x-8">
              {tabs.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`pb-2 border-b-2 ${activeTab === key ? 'border-blue-600 text-blue-600' : 'border-transparent hover:border-gray-300'}`}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <section className="mt-4">
            {activeTab === 'ficha' && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Detalles de Salud</h3>
                <p>Ficha clínica básica y notas veterinarias.</p>
              </div>
            )}
            {activeTab === 'historial' && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Historial de Citas</h3>
                <p>Lista de citas pasadas y próximas.</p>
              </div>
            )}
            {activeTab === 'vacunas' && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Vacunas</h3>
                <p>Registro de vacunas administradas.</p>
              </div>
            )}
            {activeTab === 'facturacion' && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Facturación</h3>
                <p>Facturas y pagos del cliente.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
