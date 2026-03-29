// frontend/src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex flex-col justify-center items-center bg-gray-50"
      role="main"
      aria-labelledby="notfound-title"
    >
      <h1 id="notfound-title" className="text-6xl font-bold text-gray-800">
        404
      </h1>
      <p className="text-xl text-gray-600 mt-4">
        Página no encontrada.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
