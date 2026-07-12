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

## Despliegue local

Desde la raíz del proyecto:

```bash
docker compose down --rmi all --volumes --remove-orphans
docker compose up --build -d
docker compose ps
```

### Desarrollo con recarga en caliente

Los volúmenes de `docker-compose.yml` sincronizan el código del host con los contenedores. Tras el primer `docker compose up --build -d`, **no hace falta reconstruir** los contenedores al editar archivos:

- **Frontend**: Vite recarga automáticamente al guardar cambios en `frontend/`.
- **Backend**: un watcher recompila y Spring Boot DevTools reinicia la API al guardar cambios en `backend/src/`.

Para el día a día:

```bash
docker compose up -d
```

Solo vuelve a construir si se cambian dependencias o algun dockerfile

```bash
docker compose up --build -d
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
