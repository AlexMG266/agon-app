#!/usr/bin/env bash
# ============================================================
# server-setup.sh - Preparación del servidor de producción
# para el despliegue automático con GitHub Actions (Agón App)
#
# USO (EN EL SERVIDOR):
#   1. Copia este script al servidor (p. ej. con scp)
#   2. chmod +x server-setup.sh
#   3. ./server-setup.sh
#
# Qué hace:
#   - Comprueba git, docker y docker compose plugin
#   - Crea el directorio de la app (VPS_APP_DIR, default /opt/agon)
#   - Clona (o actualiza) el repositorio
#   - Copia .env.example a .env si no existe (¡rellénalo después!)
#   - Crea la red Docker externa global-proxy-net (la usa docker-compose.prod.yml)
#   - Imprime las instrucciones para crear la deploy key y los secrets
#
# REQUISITOS previos:
#   - Git y Docker instalados
#   - El usuario con el que ejecutas debe poder usar docker (sudo)
# ============================================================
set -euo pipefail

# --- Configuración (edítalo si tu ruta/dominio difieren) ---
VPS_APP_DIR="${VPS_APP_DIR:-/opt/agon}"
REPO_URL="${REPO_URL:-git@github.com:AlexMG266/agon-app.git}"
BRANCH="${BRANCH:-main}"

echo "=============================================="
echo "  Setup servidor de producción - Agón App"
echo "=============================================="
echo "Directorio app : $VPS_APP_DIR"
echo "Repositorio    : $REPO_URL"
echo "Rama           : $BRANCH"
echo "----------------------------------------------"

command -v git >/dev/null 2>&1 || { echo "[ERROR] git no está instalado. Instálalo primero."; exit 1; }
if ! command -v docker >/dev/null 2>&1; then
  echo "[ERROR] docker no está instalado. Instálalo primero."; exit 1
fi
if ! docker compose version >/dev/null 2>&1; then
  echo "[ERROR] el plugin 'docker compose' no está disponible. Actualiza Docker o instala el plugin."; exit 1
fi
echo "[OK] git, docker y docker compose disponibles."

if ! docker ps >/dev/null 2>&1; then
  echo "[AVISO] Tu usuario no puede usar docker sin sudo."
  echo "        Ejecuta: sudo usermod -aG docker \$USER  y  cierra sesión/vuelve a entrar."
fi

if [ ! -d "$VPS_APP_DIR" ]; then
  echo "[OK] Creando $VPS_APP_DIR ..."
  sudo mkdir -p "$VPS_APP_DIR"
  sudo chown "$USER":"$USER" "$VPS_APP_DIR"
fi

cd "$VPS_APP_DIR"
if [ -d .git ]; then
  echo "[OK] Repositorio ya clonado. Haciendo pull de $BRANCH ..."
  git fetch origin
  git checkout "$BRANCH" || git checkout -b "$BRANCH" "origin/$BRANCH"
  git pull --ff-only origin "$BRANCH"
else
  echo "[OK] Clonando repositorio ..."
  git clone "$REPO_URL" .
  git checkout "$BRANCH" || git checkout -b "$BRANCH" "origin/$BRANCH"
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo "[OK] .env creado desde .env.example."
  echo "     >>> ¡IMPORTANTE! Rellena .env con los valores REALES (contraseñas, JWT, dominios) antes de desplegar:"
  echo "         nano $VPS_APP_DIR/.env"
else
  echo "[OK] .env ya existe (no se sobreescribe)."
fi

if ! docker network inspect global-proxy-net >/dev/null 2>&1; then
  echo "[OK] Creando red Docker externa 'global-proxy-net' ..."
  docker network create global-proxy-net
else
  echo "[OK] La red 'global-proxy-net' ya existe."
fi

echo "=============================================="
echo "  PASOS SIGUIENTES (hazlo manualmente)"
echo "=============================================="
echo ""
echo "A) Crear deploy key en el SERVIDOR (para que GitHub Actions haga pull):"
echo "   (Ejecuta estos comandos en el servidor como el usuario del deploy)"
echo ""
echo "   mkdir -p ~/.ssh && cd ~/.ssh"
echo "   ssh-keygen -t ed25519 -C 'github-actions-deploy' -f ~/.ssh/agon_deploy -N ''"
echo "   cat ~/.ssh/agon_deploy.pub"
echo ""
echo "B) Añadir la clave pública como deploy key en GitHub:"
echo "   Repo -> Settings -> Deploy keys -> Add deploy key"
echo "   Title: 'CI/CD Deploy'   Key: (pega la pública)   Allow write access: NO"
echo ""
echo "C) Añadir los SECRETS en GitHub Actions:"
echo "   Repo -> Settings -> Secrets and variables -> Actions -> New repository secret"
echo "   VPS_HOST     -> IP o dominio del servidor"
echo "   VPS_USER     -> usuario SSH (con permisos docker)"
echo "   VPS_SSH_KEY  -> contenido de ~/.ssh/agon_deploy (la PRIVADA)"
echo "   VPS_APP_DIR  -> $VPS_APP_DIR   (opcional, default /opt/agon)"
echo ""
echo "D) Asegúrate de que tu servidor tenga un reverse proxy (NPM) apuntando:"
echo "   app.tudominio.com -> http://127.0.0.1:8081"
echo "   api.tudominio.com -> http://127.0.0.1:8080"
echo ""
echo "E) Despliega la primera vez manualmente para verificar:"
echo "   cd $VPS_APP_DIR && docker compose -f docker-compose.prod.yml up -d --build"
echo ""
echo "=============================================="
echo "  Setup completado."
echo "=============================================="
