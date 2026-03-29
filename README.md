# MascotaFeliz

MascotaFeliz es una aplicacion fullstack para gestion veterinaria. Permite administrar perfiles de mascotas, reservas de citas, modulo de farmacia con carrito y pagos con Webpay.

## Stack tecnologico

- Backend: Django + Django REST Framework + SimpleJWT
- Frontend: React + Vite
- Base de datos (desarrollo): SQLite
- Pagos: Webpay

## Estructura del proyecto

```text
MascotaFeliz/
|-- backend/
|   |-- backend/
|   |-- mascota_feliz/
|   |-- .env.example
|   |-- requirements.txt
|   `-- manage.py
|-- frontend/
|   |-- src/
|   |-- public/
|   `-- package.json
`-- .agents/
```

## Requisitos previos

- Python 3.11+ (recomendado)
- Node.js 18+ y npm

## Levantar backend (Django)

1. Ir al backend:
   ```bash
   cd backend
   ```
2. Crear y activar entorno virtual (opcional pero recomendado):
   ```bash
   python -m venv .venv
   # Windows
   .venv\Scripts\activate
   # Linux/Mac
   source .venv/bin/activate
   ```
3. Instalar dependencias:
   ```bash
   pip install -r requirements.txt
   ```
4. Crear archivo de entorno:
   ```bash
   # Copia backend/.env.example a backend/.env
   ```
5. Aplicar migraciones:
   ```bash
   python manage.py migrate
   ```
6. Ejecutar servidor:
   ```bash
   python manage.py runserver
   ```

Backend local: `http://127.0.0.1:8000`

## Levantar frontend (React + Vite)

1. Ir al frontend:
   ```bash
   cd frontend
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar variables de entorno en `frontend/.env`:
   ```env
   VITE_API_URL=http://127.0.0.1:8000/api
   ```
4. Ejecutar entorno de desarrollo:
   ```bash
   npm run dev
   ```

Frontend local: `http://localhost:5173`

## Variables de entorno requeridas

Variables en `backend/.env`:

- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG`
- `DJANGO_ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS`
- `FRONTEND_URL`
- `WEBPAY_HOST`
- `WEBPAY_API_KEY_ID`
- `WEBPAY_API_KEY_SECRET`

Variables en `frontend/.env`:

- `VITE_API_URL`

## Seguridad para GitHub

- El proyecto ignora secretos y artefactos locales mediante `.gitignore`.
- No subir `db.sqlite3`, `.env`, `node_modules`, caches ni archivos de build.
- Para compartir configuracion, usar `backend/.env.example`.
