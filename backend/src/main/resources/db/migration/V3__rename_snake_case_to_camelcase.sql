-- ============================================================
-- V3: Unifica la convención de nombres a camelCase
--
-- Renombra los identificadores que todavía usaban snake_case a
-- camelCase, de forma coherente con las entidades JPA y con el
-- resto del esquema (1-PostgreSQLCreateTables.sql).
--
-- Nota sobre PostgreSQL: los identificadores SIN comillas se
-- pliegan a minúsculas, así que "creadorId" se almacena como
-- "creadorid". Hibernate usa PhysicalNamingStrategyStandardImpl
-- (nombres exactos, sin transformación), de modo que las entidades
-- generan SQL con identificadores sin comillas que también se
-- pliegan a minúsculas: ambas partes coinciden.
--
-- Idempotente: cada RENAME se ejecuta solo si la columna/tabla
-- antigua (snake_case) todavía existe. En BDs nuevas creadas ya
-- con 1-PostgreSQLCreateTables.sql (camelCase) no hay nada que
-- renombrar y el script no hace nada. Es seguro también para BDs
-- existentes que se "baselinearon" en V1 y ya aplicaron V2.
-- ============================================================

-- 1) Equipo: columnas snake_case -> camelCase
--    (los índices/constraints dependientes se actualizan solos en PG)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'equipo' AND column_name = 'creador_id') THEN
        ALTER TABLE equipo RENAME COLUMN creador_id TO creadorId;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'equipo' AND column_name = 'codigo_equipo') THEN
        ALTER TABLE equipo RENAME COLUMN codigo_equipo TO codigoEquipo;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'equipo' AND column_name = 'fecha_creacion') THEN
        ALTER TABLE equipo RENAME COLUMN fecha_creacion TO fechaCreacion;
    END IF;
END $$;

-- 2) Equipo_Miembros -> EquipoMiembros (+ columnas)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'equipo_miembros' AND column_name = 'equipo_id') THEN
        ALTER TABLE equipo_miembros RENAME COLUMN equipo_id TO equipoId;
        ALTER TABLE equipo_miembros RENAME COLUMN usuario_id TO usuarioId;
        ALTER TABLE equipo_miembros RENAME TO equipomiembros;
    END IF;
END $$;

-- 3) Solicitud: columnas snake_case -> camelCase
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'solicitud' AND column_name = 'candidato_id') THEN
        ALTER TABLE solicitud RENAME COLUMN candidato_id TO candidatoId;
        ALTER TABLE solicitud RENAME COLUMN decisor_id TO decisorId;
        ALTER TABLE solicitud RENAME COLUMN equipo_id TO equipoId;
        ALTER TABLE solicitud RENAME COLUMN torneo_id TO torneoId;
        ALTER TABLE solicitud RENAME COLUMN tipo_solicitud TO tipoSolicitud;
        ALTER TABLE solicitud RENAME COLUMN fecha_creacion TO fechaCreacion;
    END IF;
END $$;

-- 4) Set_Entity -> SetEntity
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_name = 'set_entity') THEN
        ALTER TABLE set_entity RENAME TO setentity;
    END IF;
END $$;

-- 5) Solicitud_Aplazamiento -> SolicitudAplazamiento
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_name = 'solicitud_aplazamiento') THEN
        ALTER TABLE solicitud_aplazamiento RENAME TO solicitudaplazamiento;
    END IF;
END $$;

-- 6) Elo_Historial -> EloHistorial
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_name = 'elo_historial') THEN
        ALTER TABLE elo_historial RENAME TO elohistorial;
    END IF;
END $$;
