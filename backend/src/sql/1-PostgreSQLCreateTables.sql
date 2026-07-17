DROP TABLE IF EXISTS Solicitud CASCADE; -- Antes era Invitacion
DROP TABLE IF EXISTS Equipo_Miembros CASCADE;
DROP TABLE IF EXISTS Equipo CASCADE;
DROP TABLE IF EXISTS Notification CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

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

CREATE TABLE Notification (
    id BIGSERIAL NOT NULL,
    usuarioId BIGINT NOT NULL,
    asunto VARCHAR(100) NOT NULL,
    cuerpo VARCHAR(500) NOT NULL,
    leido BOOLEAN NOT NULL DEFAULT FALSE,
    pendienteDeAccion BOOLEAN NOT NULL DEFAULT FALSE,
    referenciaId BIGINT,
    tipo VARCHAR(50) NOT NULL,
    fechaCreacion TIMESTAMP NOT NULL,
    CONSTRAINT NotificationPK PRIMARY KEY (id),
    CONSTRAINT NotificationUsuarioIdFK FOREIGN KEY (usuarioId) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX NotificationIndexByUsuarioId ON Notification (usuarioId);

CREATE TABLE Equipo (
    id BIGSERIAL NOT NULL,
    nombreEquipo VARCHAR(60) NOT NULL,
    descripcion VARCHAR(500) NOT NULL,
    estado VARCHAR(20) NOT NULL,
    creador_id BIGINT NOT NULL,
    codigo_equipo VARCHAR(8) NOT NULL,
    CONSTRAINT EquipoPK PRIMARY KEY (id),
    CONSTRAINT EquipoNombreUniqueKey UNIQUE (nombreEquipo),
    CONSTRAINT EquipoCreadorIdFK FOREIGN KEY (creador_id) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE Equipo_Miembros (
    equipo_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    CONSTRAINT EquipoMiembrosPK PRIMARY KEY (equipo_id, usuario_id),
    CONSTRAINT EquipoMiembrosEquipoIdFK FOREIGN KEY (equipo_id) REFERENCES Equipo(id) ON DELETE CASCADE,
    CONSTRAINT EquipoMiembrosUsuarioIdFK FOREIGN KEY (usuario_id) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE Solicitud (
    id BIGSERIAL NOT NULL,
    candidato_id BIGINT NOT NULL,
    decisor_id BIGINT NOT NULL,
    equipo_id BIGINT NOT NULL,
    estado VARCHAR(20) NOT NULL,
    tipo_solicitud VARCHAR(20) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL,
    CONSTRAINT SolicitudPK PRIMARY KEY (id),
    CONSTRAINT SolicitudCandidatoIdFK FOREIGN KEY (candidato_id) REFERENCES "User"(id) ON DELETE CASCADE,
    CONSTRAINT SolicitudDecisorIdFK FOREIGN KEY (decisor_id) REFERENCES "User"(id) ON DELETE CASCADE,
    CONSTRAINT SolicitudEquipoIdFK FOREIGN KEY (equipo_id) REFERENCES Equipo(id) ON DELETE CASCADE
);

CREATE INDEX SolicitudIndexByCandidatoId ON Solicitud (candidato_id);
CREATE INDEX SolicitudIndexByDecisorId ON Solicitud (decisor_id);