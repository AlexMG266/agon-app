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

AgonApp es una aplicación de torneos de futbolín.

## Despliegue local (desarrollo)

Desde la raíz del proyecto:

```bash
docker compose up --build -d
docker compose ps
```

> **Importante**: `docker compose down --rmi all --volumes` borra imágenes, red y los volúmenes de caché (Maven, npm y PostgreSQL), por lo que el siguiente `up --build` vuelve a descargar y compilar todo desde cero. **No lo uses en un despliegue normal**; queda reservado como "reset total" (ver más abajo).

### Desarrollo con recarga en caliente

Los volúmenes de `docker-compose.yml` sincronizan el código del host con los contenedores. Tras el primer `docker compose up --build -d`, **no hace falta reconstruir** los contenedores al editar archivos:

- **Frontend**: Vite recarga automáticamente al guardar cambios en `frontend/`.
- **Backend**: un watcher recompila y Spring Boot DevTools reinicia la API al guardar cambios en `backend/src/`.

Para el día a día:

```bash
docker compose up -d
```

Solo vuelve a construir si se cambian dependencias o algún Dockerfile:

```bash
docker compose up --build -d
```

## Despliegue en producción (VPS)

El stack de producción usa [`docker-compose.prod.yml`](docker-compose.prod.yml) y es **mucho más ligero y seguro** que el de desarrollo:

| | Desarrollo (`docker-compose.yml`) | Producción (`docker-compose.prod.yml`) |
|---|---|---|
| Backend | Maven + JDK + DevTools compilando en caliente | JAR precompilado con JRE (multi-stage) |
| Frontend | Vite dev server (Node, polling) | Build estático servido por Nginx |
| Puertos publicados | 5433 (DB), 8080 (backend), 5173 (frontend) | **Solo 8080 y 8081 en `127.0.0.1`** |
| Credenciales | Hardcodeadas (`agon`/`agon`) | Variables de entorno (`.env`) |
| Memoria en caliente | ~2 GB | **< 700 MB** |

### Arquitectura con proxy externo (Nginx Proxy Manager)

El proyecto despliega **solo el producto software** (db + backend + frontend).
El enrutado, el HTTPS y los certificados los gestiona un **reverse proxy
externo al proyecto** (Nginx Proxy Manager, Caddy, etc.) que corre en el host:

```
Cliente ──HTTPS──► NPM (host, network host)
                     ├── app.tudominio.com  ──► http://127.0.0.1:8081  (frontend, SPA estática)
                     └── api.tudominio.com  ──► http://127.0.0.1:8080  (backend, Spring Boot)
```

- El frontend llama a la API mediante `VITE_BACKEND_URL` (build arg):
  - **Subdominio dedicado (recomendado)**: `https://api.tudominio.com` → el
    navegador lo trata como cross-origin, así que `CORS_ALLOWED_ORIGINS` es
    obligatorio.
  - **Misma ruta `/api`** en el mismo dominio: el proxy externo debe reenviar
    `/api/*` → `127.0.0.1:8080` (sin el prefijo `/api`), y entonces las
    peticiones son same-origin.
- Los puertos 8080/8081 están publicados **solo en loopback** (`127.0.0.1`):
  inaccesibles desde el exterior. El NPM en `network host` los alcanza por
  `127.0.0.1`. La BD no publica ningún puerto.

### 1. Preparar el VPS

```bash
# Instalar Docker y Docker Compose (en Ubuntu/Debian)
curl -fsSL https://get.docker.com | sh

# Copiar el proyecto al servidor
scp -r . user@tu-vps:/opt/agon
cd /opt/agon
```

### 2. Configurar las credenciales

```bash
cp .env.example .env
# Genera un secreto JWT fuerte
openssl rand -hex 64   # pégalo en JWT_SIGN_KEY del .env
# Edita .env: POSTGRES_PASSWORD, JWT_SIGN_KEY, VITE_BACKEND_URL y CORS_ALLOWED_ORIGINS
nano .env
```

> ⚠️ **Nunca** subas `.env` al repositorio (ya está en `.gitignore`). En producción no uses las credenciales por defecto del desarrollo.
>
> `VITE_BACKEND_URL` es un **build arg**: se inyecta en la imagen del frontend
> en el momento de construir. Si lo cambias, hay que reconstruir la imagen
> (`docker compose -f docker-compose.prod.yml up -d --build`).

### 3. Construir y arrancar

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
```

### 4. Verificación

```bash
# Logs de cada servicio
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend

# Comprobación local (solo loopback):
curl http://127.0.0.1:8081        # frontend (HTML de la SPA)
curl http://127.0.0.1:8080/api/users/login  # backend
```

### 5. Enrutado en Nginx Proxy Manager (host)

Crea dos Proxy Hosts en NPM (con certificados Let's Encrypt):

| Dominio | Forward Hostname / IP | Forward Port | Notas |
|---|---|---|---|
| `app.tudominio.com` | `127.0.0.1` | `8081` | Frontend (SPA estática) |
| `api.tudominio.com` | `127.0.0.1` | `8080` | Backend (Spring Boot) |

Si prefieres la ruta `/api` en el mismo dominio, crea un solo Proxy Host para
`app.tudominio.com` → `127.0.0.1:8081` y añade en "Advanced" de NPM una
location que reenvíe `/api/*` → `127.0.0.1:8080` (eliminando el prefijo `/api`).
En ese caso usa `VITE_BACKEND_URL=/api`.

### Notas de seguridad

- **La base de datos no está expuesta** al exterior: sin puertos publicados,
  solo accesible desde la red interna `agon_prod_network`.
- **Backend y frontend publican solo en loopback** (`127.0.0.1`): el único
  camino desde internet es el proxy externo del host. Asegúrate de que el
  firewall del VPS no abra 8080/8081.
- **El secreto JWT y las credenciales de PostgreSQL** se inyectan desde `.env`; no hay secretos hardcodeados en el código.
- **Swagger/OpenAPI está desactivado** en el perfil `prod` (ver [`application-prod.yml`](backend/src/main/resources/application-prod.yml)).
- **CORS** está restringido a los orígenes de `CORS_ALLOWED_ORIGINS` (debe
  incluir el dominio real de la app, p. ej. `https://app.tudominio.com`).

### Reset total

Borra contenedores, imágenes, red y volúmenes (datos de la BD y cachés). Solo úsalo si quieres empezar desde cero:

```bash
docker compose -f docker-compose.prod.yml down --rmi all --volumes --remove-orphans
```

## Acceso a la aplicación

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- PostgreSQL: `localhost:5433`

## Pruebas del backend

Ejecuta Maven dentro del contenedor del backend:

```bash
docker compose exec backend mvn test
```

Clase concreta:

```bash
docker compose exec backend mvn -Dtest=UserServiceTest test
```

Método concreto:

```bash
docker compose exec backend mvn -Dtest=UserServiceTest#testLogin test
```

Build completo:

```bash
docker compose exec backend mvn install
```

## Cobertura de tests

`mvn test` y `npm test` solo ejecutan los tests: **no generan informes de cobertura**. Para obtenerlos, usa los siguientes comandos dentro de los contenedores.

### Backend (JaCoCo)

```bash
docker compose exec backend mvn test -Pcoverage
```

Genera el informe en `backend/target/site/jacoco/index.html` (junto con `jacoco.xml` y `jacoco.csv`). Como `backend/` está montado como volumen, el informe queda visible en el host.

### Frontend (Vitest)

```bash
docker compose exec frontend npm run test:coverage
```

Genera el informe en `frontend/coverage/index.html` (además de `lcov.info`, útil para extensiones de VSCode como Coverage Gutters).

### Cómo ver el informe

- En el navegador: abre `frontend/coverage/index.html` o `backend/target/site/jacoco/index.html`.
- En VSCode con la extensión **Coverage Gutters**: añade a `settings.json`:

```json
{
  "coverage-gutters.coverageBaseDir": "**",
  "coverage-gutters.coverageFileNames": ["lcov.info", "jacoco.xml"]
}
```

y usa los comandos "Display Coverage" y "Watch" de la extensión.

## Comandos Maven útiles

```bash
docker compose exec backend mvn clean
docker compose exec backend mvn compile
docker compose exec backend mvn test
docker compose exec backend mvn package
docker compose exec backend mvn install
```

## Reinicio limpio

Para borrar contenedores, imágenes, red y volúmenes del stack:

```bash
docker compose down --rmi all --volumes --remove-orphans
```

## Credenciales por defecto

- Usuario PostgreSQL: `agon`
- Contraseña PostgreSQL: `agon`
- Base de datos: `agon`

Para conectarte a la base de datos (con las credenciales por defecto): 

```bash
docker compose exec db psql -U agon -d agon
```
