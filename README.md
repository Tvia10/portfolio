# Portfolio — Tomás Via

Sitio personal full stack: **FastAPI + PostgreSQL** en el backend, **React + Vite + Tailwind** en el frontend,
desplegado con Docker en un VPS propio detrás de Traefik.

```
portfolio/
├── backend/    API FastAPI + SQLAlchemy + Alembic
├── frontend/   SPA React + TypeScript + Tailwind v4
└── deploy/     docker-compose de producción + deploy.sh
```

## Desarrollo local

Necesitás Docker, `uv` y Node 22+.

```bash
# 1. Base de datos
cd backend && docker compose up -d

# 2. Backend (http://localhost:8000, docs en /docs)
cp .env.example .env          # completar SECRET_KEY y ADMIN_PASSWORD
uv sync
uv run alembic upgrade head
uv run python -m app.seed     # carga el admin y app/seed_data.json
uv run uvicorn app.main:app --reload

# 3. Frontend (http://localhost:5173)
cd ../frontend && npm install && npm run dev
```

Vite proxea `/api` al backend, así que en dev no hay CORS ni URLs distintas.

El panel de administración está en `/admin` y entra con las credenciales del `.env`.

## Calidad

```bash
cd backend
uv run pytest        # 10 tests: auth, CRUD, validación, honeypot
uv run ruff check .
```

## Arquitectura

- **Contenido en base de datos, no hardcodeado.** Proyectos, experiencia, formación y skills se editan
  desde `/admin` sin tocar código ni redeployar.
- **Un solo usuario admin**, creado por `app/seed.py`. No hay registro público.
- **Auth JWT**: el frontend guarda el token y el backend lo valida en cada request protegida.
  El guard de React es sólo UX — la autorización real vive en el backend.
- **Formulario de contacto** con honeypot y rate limit (5/hora por IP). Los mensajes se guardan
  siempre; el mail de aviso es best-effort y corre en background.
- **Migraciones con Alembic**, aplicadas automáticamente al arrancar el contenedor en producción.

## Deploy

El VPS ya corre Traefik (lo provee el stack de n8n, dueño de los puertos 80/443), así que este stack
no publica puertos: se cuelga de la red `n8n_default` con labels de Traefik y recibe HTTPS automático.

```bash
cd deploy
cp .env.example .env     # completar dominios, passwords y SECRET_KEY
./deploy.sh all          # rsync + build + up
./deploy.sh seed         # sólo la primera vez
./deploy.sh logs api
```

`deploy.sh` sincroniza el árbol **local** (no un commit), igual que el deploy de syscow.
Verificá que tenés los cambios que querés en disco antes de correrlo.

> El frontend inlinea `VITE_API_URL` en build time: cambiar el dominio del API exige
> `./deploy.sh front` (rebuild), no alcanza con reiniciar.
