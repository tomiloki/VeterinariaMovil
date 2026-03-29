# Workflow del agente

## 1. Descubrimiento

- Revisar estructura de carpetas.
- Detectar archivos sensibles (`.env`, llaves, secretos hardcodeados).
- Revisar estado de `README`, `requirements`, y `.gitignore`.

## 2. Endurecimiento

- Mover secretos a variables de entorno.
- Crear/actualizar `.env.example`.
- Completar reglas de ignorado.

## 3. Documentacion

- Actualizar README con pasos reales para correr backend/frontend.
- Documentar variables de entorno requeridas.

## 4. Verificacion

- Confirmar existencia de `backend/requirements.txt`.
- Validar que settings use entorno para datos sensibles.
- Revisar cambios de git y detectar riesgos antes de push.
