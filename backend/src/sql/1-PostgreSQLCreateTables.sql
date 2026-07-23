DROP TABLE IF EXISTS SeguimientoTorneo CASCADE;
DROP TABLE IF EXISTS Solicitud_Aplazamiento CASCADE;
DROP TABLE IF EXISTS Set_Entity CASCADE;
DROP TABLE IF EXISTS Encuentro CASCADE;
DROP TABLE IF EXISTS Jornada CASCADE;
DROP TABLE IF EXISTS Inscripcion CASCADE;
DROP TABLE IF EXISTS Grupo CASCADE;
DROP TABLE IF EXISTS Torneo CASCADE;
DROP TABLE IF EXISTS Solicitud CASCADE;
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
    role VARCHAR(20) NOT NULL DEFAULT 'USER',  
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

-- Tablas para la Iteración 3: Gestión de Torneos

CREATE TABLE Torneo (
    id BIGSERIAL NOT NULL,
    idOrganizador BIGINT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    privado BOOLEAN NOT NULL DEFAULT FALSE,
    codigoTorneo VARCHAR(16) NOT NULL UNIQUE,
    numGrupos INTEGER,
    equiposPorGrupo INTEGER,
    tienePlayoff BOOLEAN,
    tipoTorneo VARCHAR(20),
    idaVueltaPlayoff BOOLEAN,
    estado VARCHAR(20) NOT NULL DEFAULT 'RECLUTANDO',
    CONSTRAINT TorneoPK PRIMARY KEY (id),
    CONSTRAINT TorneoOrganizadorIdFK FOREIGN KEY (idOrganizador) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX TorneoIndexByOrganizador ON Torneo (idOrganizador);

CREATE TABLE Solicitud (
    id BIGSERIAL NOT NULL,
    candidato_id BIGINT NOT NULL,
    decisor_id BIGINT NOT NULL,
    equipo_id BIGINT NOT NULL,
    torneo_id BIGINT,
    estado VARCHAR(20) NOT NULL,
    tipo_solicitud VARCHAR(20) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL,
    CONSTRAINT SolicitudPK PRIMARY KEY (id),
    CONSTRAINT SolicitudCandidatoIdFK FOREIGN KEY (candidato_id) REFERENCES "User"(id) ON DELETE CASCADE,
    CONSTRAINT SolicitudDecisorIdFK FOREIGN KEY (decisor_id) REFERENCES "User"(id) ON DELETE CASCADE,
    CONSTRAINT SolicitudEquipoIdFK FOREIGN KEY (equipo_id) REFERENCES Equipo(id) ON DELETE CASCADE,
    CONSTRAINT SolicitudTorneoIdFK FOREIGN KEY (torneo_id) REFERENCES Torneo(id) ON DELETE CASCADE
);

CREATE INDEX SolicitudIndexByCandidatoId ON Solicitud (candidato_id);
CREATE INDEX SolicitudIndexByDecisorId ON Solicitud (decisor_id);

CREATE TABLE Grupo (
    id BIGSERIAL NOT NULL,
    idTorneo BIGINT NOT NULL,
    nombreGrupo VARCHAR(50) NOT NULL,
    CONSTRAINT GrupoPK PRIMARY KEY (id),
    CONSTRAINT GrupoTorneoIdFK FOREIGN KEY (idTorneo) REFERENCES Torneo(id) ON DELETE CASCADE
);

CREATE INDEX GrupoIndexByTorneo ON Grupo (idTorneo);

CREATE TABLE Inscripcion (
    id BIGSERIAL NOT NULL,
    idTorneo BIGINT NOT NULL,
    idEquipo BIGINT NOT NULL,
    idGrupo BIGINT,
    partidosJugados INTEGER NOT NULL DEFAULT 0,
    estadoInscripcion VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
    puntosLiga INTEGER NOT NULL DEFAULT 0,
    setsGanados INTEGER NOT NULL DEFAULT 0,
    setsPerdidos INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT InscripcionPK PRIMARY KEY (id),
    CONSTRAINT InscripcionTorneoIdFK FOREIGN KEY (idTorneo) REFERENCES Torneo(id) ON DELETE CASCADE,
    CONSTRAINT InscripcionEquipoIdFK FOREIGN KEY (idEquipo) REFERENCES Equipo(id) ON DELETE CASCADE,
    CONSTRAINT InscripcionGrupoIdFK FOREIGN KEY (idGrupo) REFERENCES Grupo(id) ON DELETE SET NULL
);

CREATE INDEX InscripcionIndexByTorneo ON Inscripcion (idTorneo);
CREATE INDEX InscripcionIndexByEquipo ON Inscripcion (idEquipo);
CREATE INDEX InscripcionIndexByGrupo ON Inscripcion (idGrupo);

CREATE TABLE Jornada (
    id BIGSERIAL NOT NULL,
    idTorneo BIGINT NOT NULL,
    numeroJornada INTEGER NOT NULL,
    tipoFase VARCHAR(20) NOT NULL,
    formatoJornada VARCHAR(20) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
    fechaInicio DATE,
    fechaFin DATE,
    CONSTRAINT JornadaPK PRIMARY KEY (id),
    CONSTRAINT JornadaTorneoIdFK FOREIGN KEY (idTorneo) REFERENCES Torneo(id) ON DELETE CASCADE
);

CREATE INDEX JornadaIndexByTorneo ON Jornada (idTorneo);

CREATE TABLE Encuentro (
    id BIGSERIAL NOT NULL,
    idJornada BIGINT NOT NULL,
    idEquipoLocal BIGINT NOT NULL,
    idEquipoVisitante BIGINT NOT NULL,
    estadoEncuentro VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    fechaRealizacion TIMESTAMP,
    CONSTRAINT EncuentroPK PRIMARY KEY (id),
    CONSTRAINT EncuentroJornadaIdFK FOREIGN KEY (idJornada) REFERENCES Jornada(id) ON DELETE CASCADE,
    CONSTRAINT EncuentroLocalIdFK FOREIGN KEY (idEquipoLocal) REFERENCES Equipo(id) ON DELETE CASCADE,
    CONSTRAINT EncuentroVisitanteIdFK FOREIGN KEY (idEquipoVisitante) REFERENCES Equipo(id) ON DELETE CASCADE
);

CREATE INDEX EncuentroIndexByJornada ON Encuentro (idJornada);

CREATE TABLE Set_Entity (
    id BIGSERIAL NOT NULL,
    idEncuentro BIGINT NOT NULL,
    numeroSet INTEGER NOT NULL,
    golesLocal INTEGER NOT NULL DEFAULT 0,
    golesVisitante INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT SetEntityPK PRIMARY KEY (id),
    CONSTRAINT SetEntityEncuentroIdFK FOREIGN KEY (idEncuentro) REFERENCES Encuentro(id) ON DELETE CASCADE
);

CREATE INDEX SetEntityIndexByEncuentro ON Set_Entity (idEncuentro);

CREATE TABLE Solicitud_Aplazamiento (
    id BIGSERIAL NOT NULL,
    idEncuentro BIGINT NOT NULL,
    idEquipoSolicitante BIGINT NOT NULL,
    fechaSolicitada TIMESTAMP NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    CONSTRAINT SolicitudAplazamientoPK PRIMARY KEY (id),
    CONSTRAINT SolicitudAplEncuentroIdFK FOREIGN KEY (idEncuentro) REFERENCES Encuentro(id) ON DELETE CASCADE,
    CONSTRAINT SolicitudAplEquipoIdFK FOREIGN KEY (idEquipoSolicitante) REFERENCES Equipo(id) ON DELETE CASCADE
);

CREATE INDEX SolicitudAplazamientoIndexByEncuentro ON Solicitud_Aplazamiento (idEncuentro);

CREATE TABLE SeguimientoTorneo (
    id BIGSERIAL NOT NULL,
    usuarioId BIGINT NOT NULL,
    torneoId BIGINT NOT NULL,
    fechaCreacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT SeguimientoTorneoPK PRIMARY KEY (id),
    CONSTRAINT SeguimientoTorneoUsuarioIdFK FOREIGN KEY (usuarioId) REFERENCES "User"(id) ON DELETE CASCADE,
    CONSTRAINT SeguimientoTorneoTorneoIdFK FOREIGN KEY (torneoId) REFERENCES Torneo(id) ON DELETE CASCADE,
    CONSTRAINT SeguimientoTorneoUniqueConstraint UNIQUE (usuarioId, torneoId)
);

CREATE INDEX SeguimientoTorneoIndexByUsuarioId ON SeguimientoTorneo (usuarioId);
CREATE INDEX SeguimientoTorneoIndexByTorneoId ON SeguimientoTorneo (torneoId);
