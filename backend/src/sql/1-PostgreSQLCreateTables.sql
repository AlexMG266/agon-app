DROP TABLE IF EXISTS Invitacion CASCADE;
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
    estado VARCHAR(20) NOT NULL,
    creador_id BIGINT NOT NULL,
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

CREATE TABLE Invitacion (
    id BIGSERIAL NOT NULL,
    usuario_destino_id BIGINT NOT NULL,
    usuario_remitente_id BIGINT NOT NULL,
    equipo_id BIGINT NOT NULL,
    estado VARCHAR(20) NOT NULL,
    fechaEnvio TIMESTAMP NOT NULL,
    CONSTRAINT InvitacionPK PRIMARY KEY (id),
    CONSTRAINT InvitacionDestinoIdFK FOREIGN KEY (usuario_destino_id) REFERENCES "User"(id) ON DELETE CASCADE,
    CONSTRAINT InvitacionRemitenteIdFK FOREIGN KEY (usuario_remitente_id) REFERENCES "User"(id) ON DELETE CASCADE,
    CONSTRAINT InvitacionEquipoIdFK FOREIGN KEY (equipo_id) REFERENCES Equipo(id) ON DELETE CASCADE
);