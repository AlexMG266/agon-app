-- DROP both naming variants (snake_case legacy + camelCase) so this script is
-- idempotent against databases created with the old schema. Unquoted identifiers
-- fold to lowercase in PostgreSQL, so 'elo_historial' and 'EloHistorial' target
-- different tables and each DROP is a no-op if the table does not exist.
DROP TABLE IF EXISTS EloHistorial CASCADE;
DROP TABLE IF EXISTS elo_historial CASCADE;
DROP TABLE IF EXISTS SeguimientoTorneo CASCADE;
DROP TABLE IF EXISTS SolicitudAplazamiento CASCADE;
DROP TABLE IF EXISTS solicitud_aplazamiento CASCADE;
DROP TABLE IF EXISTS SetEntity CASCADE;
DROP TABLE IF EXISTS set_entity CASCADE;
DROP TABLE IF EXISTS Encuentro CASCADE;
DROP TABLE IF EXISTS Jornada CASCADE;
DROP TABLE IF EXISTS Inscripcion CASCADE;
DROP TABLE IF EXISTS Grupo CASCADE;
DROP TABLE IF EXISTS Torneo CASCADE;
DROP TABLE IF EXISTS Solicitud CASCADE;
DROP TABLE IF EXISTS EquipoMiembros CASCADE;
DROP TABLE IF EXISTS equipo_miembros CASCADE;
DROP TABLE IF EXISTS Equipo CASCADE;
DROP TABLE IF EXISTS Notification CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

CREATE TABLE "User" (
    id BIGSERIAL NOT NULL,
    elo INTEGER NOT NULL,
    nombre VARCHAR(60) NOT NULL,
    email VARCHAR(120) NOT NULL,
    imagenPerfil TEXT,
    password VARCHAR(60),
    fechaNacimiento DATE,
    eloProvisional BOOLEAN NOT NULL DEFAULT TRUE,
    notificacionesPartidos BOOLEAN NOT NULL DEFAULT TRUE,
    diasAntelacionPartidos INTEGER NOT NULL DEFAULT 1,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    googleId VARCHAR(100),
    CONSTRAINT UserPK PRIMARY KEY (id),
    CONSTRAINT UserNombreUniqueKey UNIQUE (nombre),
    CONSTRAINT UserGoogleIdUniqueKey UNIQUE (googleId)
);

CREATE INDEX UserIndexByNombre ON "User" (nombre);
CREATE INDEX UserIndexByEmail ON "User" (email);

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
    creadorId BIGINT NOT NULL,
    codigoEquipo VARCHAR(8) NOT NULL,
    fechaCreacion TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT EquipoPK PRIMARY KEY (id),
    CONSTRAINT EquipoNombreUniqueKey UNIQUE (nombreEquipo),
    CONSTRAINT EquipoCodigoUniqueKey UNIQUE (codigoEquipo),
    CONSTRAINT EquipoCreadorIdFK FOREIGN KEY (creadorId) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE EquipoMiembros (
    equipoId BIGINT NOT NULL,
    usuarioId BIGINT NOT NULL,
    CONSTRAINT EquipoMiembrosPK PRIMARY KEY (equipoId, usuarioId),
    CONSTRAINT EquipoMiembrosEquipoIdFK FOREIGN KEY (equipoId) REFERENCES Equipo(id) ON DELETE CASCADE,
    CONSTRAINT EquipoMiembrosUsuarioIdFK FOREIGN KEY (usuarioId) REFERENCES "User"(id) ON DELETE CASCADE
);


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
    -- Campos de creación del torneo
    fechaInicio DATE,
    fechaFin DATE,
    fechaLimiteInscripcion DATE,
    puntosVictoria INTEGER,
    puntosEmpate INTEGER,
    puntosDerrota INTEGER,
    formatoPartidos VARCHAR(20),
    diasDisponibles VARCHAR(50),
    horaInicio VARCHAR(5),
    horaFin VARCHAR(5),
    duracionPartido INTEGER,
    fechasExcluidas TEXT,
    estrategiaDistribucion VARCHAR(20),
    diasEntreJornadas INTEGER,
    estrategiaPlayoff VARCHAR(20),
    diasEntrePlayoff INTEGER,
    rondaInicioPlayoff VARCHAR(20),
    CONSTRAINT TorneoPK PRIMARY KEY (id),
    CONSTRAINT TorneoOrganizadorIdFK FOREIGN KEY (idOrganizador) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX TorneoIndexByOrganizador ON Torneo (idOrganizador);

CREATE TABLE Solicitud (
    id BIGSERIAL NOT NULL,
    candidatoId BIGINT NOT NULL,
    decisorId BIGINT NOT NULL,
    equipoId BIGINT NOT NULL,
    torneoId BIGINT,
    estado VARCHAR(20) NOT NULL,
    tipoSolicitud VARCHAR(30) NOT NULL,
    fechaCreacion TIMESTAMP NOT NULL,
    CONSTRAINT SolicitudPK PRIMARY KEY (id),
    CONSTRAINT SolicitudCandidatoIdFK FOREIGN KEY (candidatoId) REFERENCES "User"(id) ON DELETE CASCADE,
    CONSTRAINT SolicitudDecisorIdFK FOREIGN KEY (decisorId) REFERENCES "User"(id) ON DELETE CASCADE,
    CONSTRAINT SolicitudEquipoIdFK FOREIGN KEY (equipoId) REFERENCES Equipo(id) ON DELETE CASCADE,
    CONSTRAINT SolicitudTorneoIdFK FOREIGN KEY (torneoId) REFERENCES Torneo(id) ON DELETE CASCADE
);

CREATE INDEX SolicitudIndexByCandidatoId ON Solicitud (candidatoId);
CREATE INDEX SolicitudIndexByDecisorId ON Solicitud (decisorId);

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
    partidosGanados INTEGER NOT NULL DEFAULT 0,
    partidosEmpatados INTEGER NOT NULL DEFAULT 0,
    partidosPerdidos INTEGER NOT NULL DEFAULT 0,
    estadoInscripcion VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
    puntosLiga INTEGER NOT NULL DEFAULT 0,
    setsGanados INTEGER NOT NULL DEFAULT 0,
    setsPerdidos INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT InscripcionPK PRIMARY KEY (id),
    CONSTRAINT InscripcionTorneoIdFK FOREIGN KEY (idTorneo) REFERENCES Torneo(id) ON DELETE CASCADE,
    CONSTRAINT InscripcionEquipoIdFK FOREIGN KEY (idEquipo) REFERENCES Equipo(id) ON DELETE CASCADE,
    CONSTRAINT InscripcionGrupoIdFK FOREIGN KEY (idGrupo) REFERENCES Grupo(id) ON DELETE SET NULL,
    -- Red de seguridad a nivel de BD: un equipo solo puede inscribirse una vez
    -- en un mismo torneo, aunque el check del servicio falle por concurrencia.
    CONSTRAINT InscripcionTorneoEquipoUnique UNIQUE (idTorneo, idEquipo)
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

CREATE TABLE SetEntity (
    id BIGSERIAL NOT NULL,
    idEncuentro BIGINT NOT NULL,
    numeroSet INTEGER NOT NULL,
    golesLocal INTEGER NOT NULL DEFAULT 0,
    golesVisitante INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT SetEntityPK PRIMARY KEY (id),
    CONSTRAINT SetEntityEncuentroIdFK FOREIGN KEY (idEncuentro) REFERENCES Encuentro(id) ON DELETE CASCADE
);

CREATE INDEX SetEntityIndexByEncuentro ON SetEntity (idEncuentro);

CREATE TABLE SolicitudAplazamiento (
    id BIGSERIAL NOT NULL,
    idEncuentro BIGINT NOT NULL,
    idEquipoSolicitante BIGINT NOT NULL,
    fechaSolicitada TIMESTAMP NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    CONSTRAINT SolicitudAplazamientoPK PRIMARY KEY (id),
    CONSTRAINT SolicitudAplEncuentroIdFK FOREIGN KEY (idEncuentro) REFERENCES Encuentro(id) ON DELETE CASCADE,
    CONSTRAINT SolicitudAplEquipoIdFK FOREIGN KEY (idEquipoSolicitante) REFERENCES Equipo(id) ON DELETE CASCADE
);

CREATE INDEX SolicitudAplazamientoIndexByEncuentro ON SolicitudAplazamiento (idEncuentro);

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

CREATE TABLE EloHistorial (
    id BIGSERIAL NOT NULL,
    idUsuario BIGINT NOT NULL,
    idEncuentro BIGINT NOT NULL,
    eloAnterior INTEGER NOT NULL,
    eloNuevo INTEGER NOT NULL,
    resultado VARCHAR(20) NOT NULL,
    fecha TIMESTAMP NOT NULL,
    CONSTRAINT EloHistorialPK PRIMARY KEY (id),
    CONSTRAINT EloHistorialUsuarioIdFK FOREIGN KEY (idUsuario) REFERENCES "User"(id) ON DELETE CASCADE,
    CONSTRAINT EloHistorialEncuentroIdFK FOREIGN KEY (idEncuentro) REFERENCES Encuentro(id) ON DELETE CASCADE
);

CREATE INDEX EloHistorialIndexByUsuarioId ON EloHistorial (idUsuario);
