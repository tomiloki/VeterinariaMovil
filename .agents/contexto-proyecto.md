# Contexto tecnico de MascotaFeliz

## Arquitectura

- Backend en `backend/` con Django + DRF + JWT.
- Frontend en `frontend/` con React + Vite.
- Base de datos local SQLite para desarrollo.

## Dominios funcionales

- Gestion de usuarios por rol (`cliente`, `veterinario`, `admin`).
- Gestion de mascotas.
- Reserva de citas.
- Farmacia con carrito.
- Pagos con Webpay.

## Convenciones operativas

- No hardcodear secretos en codigo fuente.
- Leer variables sensibles desde entorno.
- Mantener `.env` fuera del repositorio.
- Publicar solamente archivos necesarios para ejecutar el proyecto.
