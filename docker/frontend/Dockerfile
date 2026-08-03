
# ============================================================
# Dockerfile de PRODUCCIÓN para el frontend (Agón App)
#
# Multi-stage build:
#   Stage 1 (builder): Node 22 -> `vite build` genera el estático en /app/dist
#   Stage 2 (runtime): Nginx -> sirve el estático (SPA)
#
# Ventajas frente al Dockerfile.dev:
#   - NO se ejecuta el Vite dev server (que consumía ~500 MB con polling).
#   - El build estático (~unos pocos MB) lo sirve Nginx (~30-60 MB de RAM).
#   - Nginx NO hace reverse proxy: el enrutado lo hace el proxy externo
#     del host (Nginx Proxy Manager), que reenvía a los puertos publicados.
#
# IMPORTANTE: VITE_BACKEND_URL es un ARG de build. Indica a qué URL apunta
# el frontend para llamar a la API. Con NPM se usa un subdominio dedicado y
# la API se sirve en la RAÍZ de ese dominio (sin prefijo /api):
#   - Subdominio dedicado: https://api.tudominio.com
# Se puede sobrescribir desde docker-compose.prod.yml (o --build-arg):
#   docker build --build-arg VITE_BACKEND_URL=https://api.tudominio.com ...
# ============================================================

# ARG a nivel global (accesible en todas las etapas, antes del FROM)
ARG VITE_BACKEND_URL=https://api.tudominio.com

# ---- ETAPA 1: BUILD del frontend (Node) ----
FROM node:22-alpine AS builder

WORKDIR /app

# Re-declara el ARG dentro de la etapa para poder usarlo como ENV
ARG VITE_BACKEND_URL

# Copia solo los manifiestos para cachear la instalación de dependencias
COPY frontend/package.json frontend/package-lock.json* ./

# Instala dependencias exactas del lockfile
RUN npm ci --no-audit --no-fund

# Copia el código fuente del frontend
COPY frontend/ .

# Expone la URL base de la API al build de Vite
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Compila a archivos estáticos
RUN npm run build

# ---- ETAPA 2: SERVIDOR estático (Nginx) ----
FROM nginx:1.27-alpine

# Copia el build estático
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración de servidor estático + headers de seguridad
COPY docker/frontend/nginx.prod.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Nginx corre como no-root en la imagen oficial (nginx user)
