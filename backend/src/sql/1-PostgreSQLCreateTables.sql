DROP TABLE IF EXISTS "Notification";
DROP TABLE IF EXISTS "User";

CREATE TABLE "User" (
    id BIGSERIAL NOT NULL,
    elo INTEGER NOT NULL,
    nombre VARCHAR(60) NOT NULL,
    email VARCHAR(120) NOT NULL,
    imagenPerfil TEXT,
    password VARCHAR(60) NOT NULL,
    fechaNacimiento DATE NOT NULL,
    eloProvisional BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT UserPK PRIMARY KEY (id),
    CONSTRAINT UserNombreUniqueKey UNIQUE (nombre)
);

CREATE INDEX UserIndexByNombre ON "User" (nombre);

CREATE TABLE "Notification" (
    id BIGSERIAL NOT NULL,
    usuarioId BIGINT NOT NULL,
    mensaje VARCHAR(500) NOT NULL,
    leido BOOLEAN NOT NULL DEFAULT FALSE,
    pendienteDeAccion BOOLEAN NOT NULL DEFAULT FALSE,
    referenciaId BIGINT,
    tipo VARCHAR(50) NOT NULL,
    fechaCreacion TIMESTAMP NOT NULL,
    CONSTRAINT NotificationPK PRIMARY KEY (id),
    CONSTRAINT NotificationUsuarioIdFK FOREIGN KEY (usuarioId) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX NotificationIndexByUsuarioId ON "Notification" (usuarioId);
