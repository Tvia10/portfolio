#!/usr/bin/env bash
# Deploy del portfolio al VPS de Hostinger.
#
# Igual que syscow: se rsyncea el arbol local a /docker/portfolio y se
# construye alla. Todas las ordenes remotas reusan la conexion multiplexada
# del host `syscow-vps` (~/.ssh/config), porque sshd banea reconexiones rapidas.
set -euo pipefail

HOST="syscow-vps"
REMOTE_DIR="/docker/portfolio"
LOCAL_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$LOCAL_ROOT/deploy"
[[ -f .env ]] || { echo "Falta deploy/.env (copiá .env.example y completalo)"; exit 1; }

remote() { ssh "$HOST" "cd $REMOTE_DIR/deploy && $*"; }

push() {
  echo "→ Sincronizando código a $HOST:$REMOTE_DIR"
  ssh "$HOST" "mkdir -p $REMOTE_DIR"
  rsync -az --delete \
    --exclude '.venv' --exclude '__pycache__' --exclude '.pytest_cache' \
    --exclude '.ruff_cache' --exclude '.env' \
    "$LOCAL_ROOT/backend/" "$HOST:$REMOTE_DIR/backend/"
  rsync -az --delete \
    --exclude 'node_modules' --exclude 'dist' --exclude '.env' \
    "$LOCAL_ROOT/frontend/" "$HOST:$REMOTE_DIR/frontend/"
  rsync -az \
    "$LOCAL_ROOT/deploy/docker-compose.yml" "$LOCAL_ROOT/deploy/.env" \
    "$LOCAL_ROOT/deploy/deploy.sh" "$HOST:$REMOTE_DIR/deploy/"
}

case "${1:-all}" in
  all)
    push
    remote "docker compose up -d --build"
    echo "✓ Listo. Sitio: https://$(grep ^SITE_DOMAIN .env | cut -d= -f2)"
    ;;
  back)
    push
    remote "docker compose up -d --build api"
    ;;
  front)
    # El frontend inlinea VITE_API_URL en build time, por eso siempre --build.
    push
    remote "docker compose up -d --build web"
    ;;
  seed)
    remote "docker compose exec -T api python -m app.seed"
    ;;
  migrate)
    remote "docker compose exec -T api alembic upgrade head"
    ;;
  logs)
    remote "docker compose logs -f --tail=100 ${2:-}"
    ;;
  ps)
    remote "docker compose ps"
    ;;
  shell)
    ssh -t "$HOST" "cd $REMOTE_DIR/deploy && docker compose exec api bash"
    ;;
  *)
    echo "Uso: ./deploy.sh [all|back|front|seed|migrate|logs|ps|shell]"
    exit 1
    ;;
esac
