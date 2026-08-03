<p align="center">
  <img src="https://img.shields.io/badge/AgonApp-Project-0F172A?style=for-the-badge" alt="AgonApp" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=000" alt="React" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Maven-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white" alt="Maven" />
</p>

**AgonApp** es una aplicación web de gestión de torneos de futbolín, desarrollada con Spring Boot (backend) y React (frontend). Este repositorio incluye dos entornos Docker completamente separados: **desarrollo** (recarga en caliente) y **producción** (ligero y seguro).

---

## Índice

1. [Requisitos](#requisitos)
2. [Estructura del proyecto](#estructura-del-proyecto)
3. [Desarrollo local](#desarrollo-local)
4. [Producción (VPS)](#produccion-vps)
   - [Arquitectura](#arquitectura)
   - [Despliegue paso a paso](#despliegue-paso-a-paso)
   - [Configuración de Nginx Proxy Manager](#configuracion-de-nginx-proxy-manager)
   - [Notas de seguridad](#notas-de-seguridad-produccion)
   - [Operación y mantenimiento](#operacion-y-mantenimiento-produccion)
5. [Pruebas y cobertura](#pruebas-y-cobertura)
6. [Credenciales por defecto (desarrollo)](#credenciales-por-defecto-desarrollo)
7. [Solución de problemas](#solucion-de-problemas)

---

## Requisitos

- **Docker** (con Compose v2 integrado)
- **Git** (opcional, para clonar)
- **4 GB de RAM libres** en el VPS para el stack de producción

## Estructura del proyecto

```
.
├── docker-compose.yml          # Entorno de DESARROLLO (recarga en caliente)
├── docker-compose.prod.yml     # Entorno de PRODUCCIÓN (VPS)
├── .env.example                # Plantilla de variables para producción
├── docker/
│   ├── backend/                # Dockerfiles del backend (dev y prod)
│   ├── frontend/               # Dockerfiles + nginx.prod.conf (dev y prod)
│   └── db/                     # Init de la BD de desarrollo
├── backend/                    # API Spring Boot (Maven)
│   └── src/main/resources/
│       ├── application.yml         # Config común (JWT/CORS por entorno)
│       └── application-prod.yml    # Ajustes específicos de producción
└── frontend/                   # SPA React (Vite)
```

---

## Desarrollo local

### Primer arranque

Desde la raíz del proyecto:

```bash
docker compose up --build -d
docker compose ps
```

> **Nota**: la primera vez se construyen las imágenes y se descargan las dependencias (Maven, npm y PostgreSQL). Puede tardar unos minutos.

### Recarga en caliente

Los volúmenes de [`docker-compose.yml`](docker-compose.yml) sincronizan el código del host con los contenedores. **No hace falta reconstruir** al editar archivos:

- **Frontend**: Vite recarga automáticamente al guardar cambios en `frontend/`.
- **Backend**: un watcher recompila y Spring Boot DevTools reinicia la API al guardar cambios en `backend/src/`.

Para el día a día:

```bash
docker compose up -d
```

Solo reconstruye cuando cambian dependencias o algún Dockerfile:

```bash
docker compose up --build -d
```

### Acceso a la aplicación

| Servicio | URL |
|---|---|
| Frontend | <http://localhost:5173> |
| Backend (API) | <http://localhost:8080> |
| PostgreSQL | `localhost:5433` |

### Datos de prueba en desarrollo

La BD de desarrollo arranca con el esquema y los datos de prueba ya cargados
(se inyectan automáticamente en el primer arranque):

- Organizador: `user000` / `User000!`
- Jugadores: `test001` a `test040` / `TestXXX!` (donde `XXX` es el número)

### Reset del entorno de desarrollo

```bash
# Borra contenedores, red y volúmenes (BD, cachés Maven/npm)
docker compose down --volumes

# Borra además las imágenes (el siguiente up --build vuelve a descargar todo)
docker compose down --rmi all --volumes
```

> ⚠️ Es un **reset total**: se pierden todos los datos. No lo uses en el día a día.

---

## Producción (VPS)

El stack de producción usa [`docker-compose.prod.yml`](docker-compose.prod.yml).
Está diseñado para un VPS con **4 GB de RAM**, priorizando **seguridad** y **consumo mínimo de recursos**:

| | Desarrollo | Producción |
|---|---|---|
| Backend | Maven + JDK + DevTools compilando en caliente | JAR precompilado con JRE (multi-stage) |
| Frontend | Vite dev server (Node, polling) | Build estático servido por Nginx |
| Puertos publicados | 5433 (BD), 8080 (backend), 5173 (frontend) | **Solo `8080` y `8081` en `127.0.0.1`** |
| Credenciales | Hardcodeadas (`agon`/`agon`) | Variables de entorno (`.env`) |
| Memoria en caliente | ~2 GB | **< 700 MB** |

### Arquitectura

El proyecto despliega **solo el producto software**: base de datos, backend y frontend.
El **enrutado, el HTTPS y los certificados** los gestiona un **reverse proxy externo**
al proyecto —[**Nginx Proxy Manager**](https://nginxproxymanager.com/) (NPM) es el
recomendado— que corre en el propio VPS:

```
Cliente ──HTTPS──► NPM (en el host, --network host)
                     ├── app.tudominio.com  ──► http://127.0.0.1:8081  (frontend, SPA estática)
                     └── api.tudominio.com  ──► http://127.0.0.1:8080  (backend, Spring Boot)
```

**Puntos clave:**

- Los puertos `8080` y `8081` se publican **solo en loopback** (`127.0.0.1`):
  inaccesibles desde internet. NPM, al correr en modo `network host`, los alcanza
  por `127.0.0.1`. La base de datos **no publica ningún puerto**.
- El frontend llama a la API mediante `VITE_BACKEND_URL` (variable de build):
  - **Subdominio dedicado (recomendado)**: `https://api.tudominio.com`. El
    navegador lo trata como *cross-origin*, así que `CORS_ALLOWED_ORIGINS` es obligatorio.
  - **Misma ruta `/api`** en el mismo dominio: NPM debe reenviar `/api/*` →
    `127.0.0.1:8080` (eliminando el prefijo `/api`). Las peticiones son *same-origin*.
- Los scripts SQL de esquema y **datos de prueba** se ejecutan **automáticamente
  en el primer arranque** de la BD (ver [Datos de prueba](#datos-de-prueba)).

### Despliegue paso a paso

#### 1. Preparar el VPS

```bash
# Instalar Docker y Docker Compose (Ubuntu/Debian)
curl -fsSL https://get.docker.com | sh

# Copiar el proyecto al servidor
scp -r . user@tu-vps:/opt/agon
# (alternativa: git clone https://github.com/tu-usuario/agon-app.git /opt/agon)
cd /opt/agon
```

#### 2. Configurar las credenciales

```bash
cp .env.example .env
openssl rand -hex 64          # genera un secreto JWT fuerte
nano .env                     # edita los valores (ver tabla siguiente)
```

| Variable | Qué es | Valor recomendado |
|---|---|---|
| `POSTGRES_PASSWORD` | Contraseña de la BD | Contraseña fuerte (≥ 16 caracteres) |
| `JWT_SIGN_KEY` | Secreto de firma de tokens | `openssl rand -hex 64` |
| `JWT_EXPIRATION_MINUTES` | Validez del token | `1440` (24 h) |
| `VITE_BACKEND_URL` | URL de la API que usa el frontend | `https://api.tudominio.com` (o `/api`) |
| `CORS_ALLOWED_ORIGINS` | Orígenes permitidos en el navegador | `https://app.tudominio.com` |

> ⚠️ **Nunca** subas `.env` al repositorio (ya está en `.gitignore`). En
> producción no uses las credenciales por defecto de desarrollo.
>
> ℹ️ `VITE_BACKEND_URL` es un **build arg**: se inyecta en la imagen del frontend
> **al construir**. Si lo cambias, debes reconstruir la imagen:
> `docker compose -f docker-compose.prod.yml up -d --build`.

#### 3. Construir y arrancar

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
```

#### 4. Verificar el despliegue

```bash
# Logs de cada servicio
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs db

# Comprobación local (solo loopback):
curl http://127.0.0.1:8081                          # frontend -> HTML de la SPA
curl -X POST http://127.0.0.1:8080/api/users/login \
     -H 'Content-Type: application/json' \
     -d '{"username":"x","password":"x"}'           # backend -> 401/404 (esperado)
```

#### Datos de prueba

En el primer arranque (volumen vacío), PostgreSQL ejecuta automáticamente:

1. [`1-PostgreSQLCreateTables.sql`](backend/src/sql/1-PostgreSQLCreateTables.sql) → esquema de tablas
2. [`3-SeedData.sql`](backend/src/sql/3-SeedData.sql) → datos de prueba

Esto permite hacer **pruebas en vivo** con datos ya cargados:

- Organizador: `user000` / `User000!`
- Jugadores: `test001` a `test040` / `TestXXX!`
- 20 equipos, 84 torneos, historial de ELO, notificaciones, etc.

> Los scripts solo se ejecutan **una única vez** (cuando el volumen `agon_prod_postgres_data`
> está vacío). Si ya levantaste la BD sin seed y quieres reinicializar:
>
> ```bash
> docker compose -f docker-compose.prod.yml down -v   # borra el volumen (¡todos los datos!)
> docker compose -f docker-compose.prod.yml up -d
> ```

### Configuración de Nginx Proxy Manager

Crea **dos Proxy Hosts** en NPM (con certificados Let's Encrypt):

| Dominio | Forward Hostname / IP | Forward Port | Notas |
|---|---|---|---|
| `app.tudominio.com` | `127.0.0.1` | `8081` | Frontend (SPA estática) |
| `api.tudominio.com` | `127.0.0.1` | `8080` | Backend (Spring Boot) |

**Alternativa con ruta `/api`** (un solo dominio): crea un Proxy Host para
`app.tudominio.com` → `127.0.0.1:8081` y añade en "Advanced" de NPM una location
que reenvíe `/api/*` → `127.0.0.1:8080` (eliminando el prefijo `/api`). En ese
caso usa `VITE_BACKEND_URL=/api` en el `.env`.

> 🔁 Recuerda: si cambias `VITE_BACKEND_URL`, reconstruye la imagen del frontend.

### Notas de seguridad (producción)

- **Base de datos aislada**: sin puertos publicados, solo accesible desde la red interna `agon_prod_network`.
- **Loopback para backend y frontend**: el único camino desde internet es NPM. El firewall del VPS **no debe abrir** los puertos `8080`/`8081`.
- **Secretos desde `.env`**: credenciales de PostgreSQL y clave JWT se inyectan por entorno; no hay secretos hardcodeados.
- **Swagger/OpenAPI desactivado** en el perfil `prod` ([`application-prod.yml`](backend/src/main/resources/application-prod.yml)).
- **CORS restringido** a `CORS_ALLOWED_ORIGINS` (debe incluir el dominio real, p. ej. `https://app.tudominio.com`).
- **Nginx hardening**: el contenedor del frontend sirve estáticos con headers de seguridad (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `X-XSS-Protection`).

### Operación y mantenimiento (producción)

```bash
# Estado y logs
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend

# Detener / arrancar / reiniciar
docker compose -f docker-compose.prod.yml stop
docker compose -f docker-compose.prod.yml start
docker compose -f docker-compose.prod.yml restart backend

# Reconstruir tras cambiar código o .env
docker compose -f docker-compose.prod.yml up -d --build
```

**Reset total** (borra contenedores, imágenes, red y volúmenes):

```bash
docker compose -f docker-compose.prod.yml down --rmi all --volumes --remove-orphans
```

> ⚠️ Se pierden todos los datos. Solo para empezar desde cero.

---

## Pruebas y cobertura

Ejecuta los tests dentro de los contenedores (sin instalar Maven ni Node en el host):

### Backend

```bash
# Todos los tests
docker compose exec backend mvn test

# Clase concreta
docker compose exec backend mvn -Dtest=UserServiceTest test

# Método concreto
docker compose exec backend mvn -Dtest=UserServiceTest#testLogin test

# Build completo
docker compose exec backend mvn install
```

### Cobertura

`mvn test` y `npm test` **no generan informes de cobertura**; para obtenerlos:

```bash
# Backend (JaCoCo) -> backend/target/site/jacoco/index.html
docker compose exec backend mvn test -Pcoverage

# Frontend (Vitest) -> frontend/coverage/index.html
docker compose exec frontend npm run test:coverage
```

### Ver los informes

- En el navegador: abre `frontend/coverage/index.html` o `backend/target/site/jacoco/index.html`.
- En VSCode con la extensión **Coverage Gutters**, añade a `settings.json`:

```json
{
  "coverage-gutters.coverageBaseDir": "**",
  "coverage-gutters.coverageFileNames": ["lcov.info", "jacoco.xml"]
}
```

y usa los comandos "Display Coverage" y "Watch".

---

## Credenciales por defecto (desarrollo)

| Servicio | Usuario | Contraseña | BD |
|---|---|---|---|
| PostgreSQL | `agon` | `agon` | `agon` |

Conectarse a la BD de desarrollo:

```bash
docker compose exec db psql -U agon -d agon
```

> ⚠️ Estas credenciales son **solo para desarrollo**. En producción se definen en `.env`.

---

## Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| `backend` reinicia en bucle | No puede conectar con la BD | Espera al healthcheck de `db`; revisa `docker compose logs backend` |
| `db` no está healthy | Credenciales de `.env` incorrectas | Revisa `POSTGRES_USER/PASSWORD/DB` y `docker compose logs db` |
| La API responde `404` en `/api/...` | NPM no reenvía `/api` sin el prefijo | Revisa la location en NPM (debe eliminar el prefijo `/api`) |
| CORS bloqueado en el navegador | `CORS_ALLOWED_ORIGINS` no incluye el dominio real | Añádelo y reinicia el backend |
| El frontend no llama a la API | `VITE_BACKEND_URL` incorrecto en el build | Cámbialo en `.env` y reconstruye (`up -d --build`) |
| No hay datos de prueba | El volumen de la BD ya existía al añadir el seed | `down -v` y vuelve a levantar (pierde datos) |
| No responde desde internet | Firewall o DNS | Abre solo `80/443`; apunta los dominios a la IP del VPS |
