# Checklist de publicacion en GitHub

- [ ] Existe `.gitignore` en la raiz.
- [ ] `.gitignore` excluye `db.sqlite3`, `*.sqlite3`, `__pycache__/`, `*.pyc`, `.env`, `node_modules/`, `frontend/.vite/`, `frontend/dist/`.
- [ ] No hay secretos hardcodeados en `backend/backend/settings.py`.
- [ ] Existe `backend/.env.example` sin valores reales.
- [ ] Existe `backend/requirements.txt`.
- [ ] README explica setup backend y frontend.
- [ ] Se reviso `git status` para evitar subir artefactos locales.
