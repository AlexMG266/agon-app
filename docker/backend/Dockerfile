
# ============================================================
# Dockerfile de PRODUCCIÓN para el backend (Agón API)
#
# Multi-stage build:
#   Stage 1 (builder): JDK 21 + Maven -> compila y empaqueta el JAR
#   Stage 2 (runtime): SOLO JRE 21-alpine -> ejecuta el JAR
#
# Ventajas frente al Dockerfile.dev:
#   - No monta volúmenes de código ni ejecuta Maven en caliente.
#   - La imagen final pesa ~150 MB (sin JDK, sin Maven, sin fuentes).
#   - Se ejecuta con usuario NO root (principio de mínimo privilegio).
#   - Consumo de RAM contenido: ~450-512 MB en lugar de ~1.5 GB.
# ============================================================

# ---- ETAPA 1: BUILD (se descarta al final de la imagen) ----
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Copia solo el pom.xml para cachear la descarga de dependencias
COPY backend/pom.xml .

# Pre-descarga de dependencias y plugins (caché de capas de Docker:
# si el pom.xml no cambia, esta capa no se reconstruye)
RUN mvn -B -DskipTests dependency:resolve dependency:resolve-plugins

# Copia el código fuente
COPY backend/src ./src

# Empaqueta el JAR ejecutable (ignora los tests y el sql-maven-plugin, que
# requiere la BD de desarrollo "db" inexistente en este contexto de build).
RUN mvn -B -DskipTests -DsqlPlugin.skip=true package

# ---- ETAPA 2: RUNTIME (solo JRE, mínimo y seguro) ----
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Crea un usuario sin privilegios para ejecutar la app
RUN addgroup -S spring && adduser -S spring -G spring

# Copia SOLO el JAR desde la etapa de build
COPY --from=builder /app/target/*.jar app.jar

# Cambia al usuario no root
USER spring

EXPOSE 8080

# La memoria se limita desde compose (deploy.resources) y con -Xmx.
# Las variables de entorno (datasource, JWT, perfil) se inyectan en runtime.
ENTRYPOINT ["java", "-Xmx512m", "-XX:MaxMetaspaceSize=256m", "-jar", "/app/app.jar"]
