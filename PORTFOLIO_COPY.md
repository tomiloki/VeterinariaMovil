# Portfolio Copy - MascotaFeliz

## Descripcion corta (GitHub)

MascotaFeliz es una plataforma fullstack de gestion veterinaria con autenticacion por roles, reservas de citas, perfiles de mascotas, farmacia con carrito y flujo de pago integrado con Webpay (entorno de integracion).

## Descripcion media (README/portfolio web)

Desarrolle MascotaFeliz como proyecto de portafolio para resolver el flujo completo de una clinica veterinaria moderna: desde el registro del tutor y su mascota, hasta la reserva de atencion, compra en farmacia y confirmacion de pagos.
El sistema esta construido con Django + DRF en backend y React + Vite en frontend, con control de permisos por rol (`cliente`, `veterinario`, `admin`), pruebas automatizadas y documentacion de despliegue para entornos de demostracion.

## Version LinkedIn (post)

Termine MascotaFeliz, una app fullstack de gestion veterinaria enfocada en flujo real de negocio.
Incluye:
- autenticacion JWT por roles,
- reserva de citas y seguimiento,
- farmacia con carrito y detalle de productos,
- pagos Webpay en ambiente de integracion,
- pruebas automatizadas backend + build/lint frontend.

Stack: Django, DRF, SimpleJWT, React, Vite, SQLite.
Deploy: frontend en Vercel y backend preparado para Render (free tier demo).

## Impacto tecnico (bullets para CV)

- Diseñe y consolide un backend REST con Django/DRF y permisos por rol para separar acceso de clientes, veterinarios y administradores.
- Endureci el flujo de pagos (init/commit/fail) para evitar confirmaciones inconsistentes y mejorar trazabilidad transaccional.
- Implemente un frontend React con rutas protegidas, contexto de autenticacion y experiencia orientada a demo comercial.
- Agregue pruebas automatizadas para rutas criticas de negocio y validaciones de seguridad basicas.
- Prepare el proyecto para publicacion en GitHub y despliegue, con manejo de secretos por entorno y documentacion operativa.

## Tags sugeridos

`django` `djangorestframework` `react` `vite` `jwt` `webpay` `fullstack` `portfolio-project` `veterinary-tech`
