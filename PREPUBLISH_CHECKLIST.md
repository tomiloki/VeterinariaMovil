# Prepublish Checklist - MascotaFeliz

Fecha de verificacion: 2026-03-29

## Estado

- [x] Existe `.gitignore` en la raiz.
- [x] `.gitignore` excluye `db.sqlite3`, `*.sqlite3`, `__pycache__/`, `*.pyc`, `.env`, `node_modules/`, `frontend/.vite/`, `frontend/dist/`.
- [x] Existe `backend/.env.example` sin secretos reales.
- [x] Existe `backend/requirements.txt`.
- [x] `settings.py` lee variables sensibles desde entorno.
- [x] README actualizado con setup local y deploy.
- [x] No hay archivos `.env` o `.sqlite3` trackeados por git.
- [x] `python manage.py check` OK.
- [x] `python manage.py test` OK.
- [x] `npm run lint` OK.
- [x] `npm run build` OK.

## Nota antes de push

- El repo tiene muchos cambios locales pendientes (`git status` no esta limpio), lo cual es esperado por el trabajo acumulado en esta sesion.
- Recomendado antes de publicar:
  - revisar `git diff`,
  - hacer commit por bloques logicos (backend, frontend, docs),
  - evitar incluir archivos temporales o de logs locales.
