# MascotaFeliz

MascotaFeliz es una app fullstack de gestion veterinaria para portafolio.
Incluye autenticacion por roles, gestion de mascotas, reserva de citas, farmacia con carrito y pago con Webpay en ambiente de integracion.

## Stack

- Backend: Django + Django REST Framework + SimpleJWT
- Frontend: React + Vite + React Router
- Base de datos: SQLite (desarrollo)
- Pagos: Webpay (Transbank Integracion)

## Arquitectura

- `backend/backend/`: configuracion Django (settings, urls, wsgi).
- `backend/mascota_feliz/`: dominio de negocio (modelos, serializers, vistas, rutas, tests).
- `frontend/src/`: interfaz React (rutas publicas/protegidas, paginas y componentes).
- API publica: prefijo unico `/api/`.

## Variables de entorno

### Backend (`backend/.env`)

Ejemplo base (ver tambien `backend/.env.example`):

```env
DJANGO_SECRET_KEY=replace-with-a-secure-secret
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost
DATABASE_URL=sqlite:///db.sqlite3

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
CSRF_TRUSTED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
FRONTEND_URL=http://localhost:5173

DRF_THROTTLE_ANON=120/min
DRF_THROTTLE_USER=300/min
DRF_THROTTLE_AUTH=20/min
DRF_THROTTLE_PAYMENT_INIT=60/min
DRF_THROTTLE_PAYMENT_COMMIT=120/min

JWT_ACCESS_MINUTES=30
JWT_REFRESH_DAYS=7
JWT_ROTATE_REFRESH_TOKENS=False

WEBPAY_HOST=https://webpay3gint.transbank.cl
WEBPAY_API_KEY_ID=597055555532
WEBPAY_API_KEY_SECRET=replace-with-webpay-secret
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

## Levantar local (desarrollo)

### Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux/Mac
source .venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo_data
python manage.py runserver
```

Backend local: `http://127.0.0.1:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend local: `http://localhost:5173`

## Datos demo

```bash
cd backend
python manage.py seed_demo_data
```

Reset de catalogo demo:

```bash
python manage.py seed_demo_data --reset
```

Credenciales demo:

- `cliente_demo / Demo1234`
- `veterinario_demo / Demo1234`
- `admin_demo / Demo1234`

## Pruebas recomendadas

### Backend

```bash
cd backend
python manage.py check
python manage.py test
python manage.py test mascota_feliz.tests.DemoSmokeFlowTests
```

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

## Deploy

### 1) Frontend en Vercel

Sube `frontend/` a Vercel y configura:

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Env var: `VITE_API_URL=https://TU_BACKEND/api`

### 2) Backend en Render (gratis, modo demo)

Este repo incluye `render.yaml` para deploy rapido.

Pasos:

1. Conecta el repo en Render.
2. Crea servicio usando `render.yaml`.
3. Ajusta variables:
   - `CORS_ALLOWED_ORIGINS=https://tu-frontend.vercel.app`
   - `CSRF_TRUSTED_ORIGINS=https://tu-frontend.vercel.app`
   - `FRONTEND_URL=https://tu-frontend.vercel.app`
   - `WEBPAY_API_KEY_SECRET` (en el panel de Render)
4. Deploy.

Notas para plan gratis:

- El servicio puede entrar en sleep por inactividad.
- Con `sqlite:///db.sqlite3` en entorno gratis, la persistencia es limitada para demo.
- El `startCommand` ejecuta migraciones y `seed_demo_data` para dejar datos listos.

## Flujo demo principal

1. Login como cliente demo.
2. Reserva cita en `/reservar`.
3. Revisa resumen en `/reservar/exito`.
4. Paga con Webpay.
5. Confirma en `/reservar/confirmar`.
6. Revisa farmacia, detalle de producto, carrito y pago de orden.

## Seguridad y buenas practicas aplicadas

- Secretos en variables de entorno.
- `.env` y artefactos locales excluidos del repo.
- JWT con expiracion configurable.
- Throttling DRF para auth y pagos.
- Validacion de commit de pago antes de marcar transaccion exitosa.
- CORS/CSRF por entorno.
