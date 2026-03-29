// frontend/src/pages/mascotaProfile.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';

export default function MascotaProfile() {
  const { id } = useParams();
  const { fetchWithAuth } = useAuth();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ficha');

  useEffect(() => {
    setLoading(true);
    fetchWithAuth(`/mascotas/${id}/`)
      .then(({ data }) => {
        setPet(data);
        setError(null);
      })
      .catch(err => {
        console.error('Error cargando datos de mascota:', err);
        setError('No se pudo cargar la información de la mascota.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, fetchWithAuth]);

  const tabs = useMemo(() => [
    { key: 'ficha', label: 'Ficha Clínica' },
    { key: 'historial', label: 'Historial de Citas' },
    { key: 'vacunas', label: 'Vacunas' },
    { key: 'facturacion', label: 'Facturación' },
  ], []);

  if (loading) {
    return <div className="loading-spinner">Cargando datos de la mascota...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!pet) {
    return <div className="text-center p-8">Mascota no encontrada.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Mascota Feliz</h1>
          <nav className="space-x-4">
            <Link to="/" className="hover:underline">Home</Link>
            <a href="#servicios" className="hover:underline">Servicios</a>
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
              src={pet.fotoUrl ?? '/placeholder-pet.jpg'}
              alt={`Foto de ${pet.nombre}`}
              className="w-32 h-32 object-cover rounded-full"
            />
            <div>
              <h2 className="text-3xl font-bold mb-1">{pet.nombre}</h2>
              <p className="text-gray-600">
                {pet.especie} – {pet.raza || 'Sin especificar'}
              </p>
              <p className="text-gray-600">Edad: {pet.edad} años</p>
              <p className="text-gray-600">Peso: {pet.peso} kg</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b">
            <nav className="-mb-px flex space-x-8">
              {tabs.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`pb-2 border-b-2 ${
                    activeTab === key
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent hover:border-gray-300'
                  }`}
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
                <p>{pet.notasClinicas || 'Sin notas clínicas disponibles.'}</p>
              </div>
            )}
            {activeTab === 'historial' && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Historial de Citas</h3>
                {pet.citas?.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {pet.citas.map(cita => (
                      <li key={cita.id}>
                        {new Date(cita.fecha).toLocaleString()} – {cita.subservicio}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No hay historial de citas.</p>
                )}
              </div>
            )}
            {activeTab === 'vacunas' && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Vacunas</h3>
                {pet.vacunas?.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {pet.vacunas.map(vacuna => (
                      <li key={vacuna.id}>
                        {vacuna.nombre} – {new Date(vacuna.fecha).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No hay registro de vacunas.</p>
                )}
              </div>
            )}
            {activeTab === 'facturacion' && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Facturación</h3>
                {pet.facturas?.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {pet.facturas.map(factura => (
                      <li key={factura.id}>
                        Factura #{factura.id} – ${factura.total.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No hay facturas disponibles.</p>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
