#!/bin/bash
# ============================================================
# inicializacion de la BD de desarrollo (AGON).
#
# Sustituye al montaje directo de los .sql en /docker-entrypoint-initdb.d:
#   - Siempre crea el esquema (1-PostgreSQLCreateTables.sql).
#   - Solo inyecta los datos de prueba (3-SeedData.sql) si AGON_SEED=true.
#
# Uso (desde la raiz del proyecto):
#   docker compose up -d --build                # solo esquema
#   AGON_SEED=true docker compose up -d --build # esquema + seed
#
# Nota: este script solo se ejecuta cuando el volumen postgres_data está vacío
# (primera inicialización o tras `docker compose down -v`).
# ============================================================
set -e

echo ">>> [AGON] Creando esquema de tablas (1-PostgreSQLCreateTables.sql)"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
    -f /scripts/1-PostgreSQLCreateTables.sql

if [ "${AGON_SEED:-false}" = "true" ]; then
    echo ">>> [AGON] AGON_SEED=true: inyectando datos de prueba (3-SeedData.sql)"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
        -f /scripts/3-SeedData.sql
else
    echo ">>> [AGON] Sin seed (AGON_SEED!=true): BD inicializada solo con el esquema."
fi

echo ">>> [AGON] Inicialización de BD completada."
