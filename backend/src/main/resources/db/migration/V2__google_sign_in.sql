-- ============================================================
-- V2: "Sign in with Google"
--
-- 1) Añade la columna googleId a la tabla "User" (y su UNIQUE) si
--    aún no existe.
-- 2) Hace opcionales las columnas password y fechaNacimiento: los
--    usuarios creados vía "Sign in with Google" no tienen contraseña
--    ni fecha de nacimiento (ambas valen NULL).
--
-- Idempotente: puede ejecutarse varias veces sin errores. Es seguro
-- tanto para BDs existentes (esquema antiguo sin googleId y con
-- password/fechaNacimiento NOT NULL) como para BDs nuevas creadas ya
-- con 1-PostgreSQLCreateTables.sql (los cambios ya están hechos).
-- ============================================================

-- 1) Columna googleId (IF NOT EXISTS es nativo y seguro).
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS googleId VARCHAR(100);

-- 2) UNIQUE sobre googleId si no existe (PostgreSQL no tiene
--    "ADD CONSTRAINT IF NOT EXISTS").
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'UserGoogleIdUniqueKey'
    ) THEN
        ALTER TABLE "User" ADD CONSTRAINT "UserGoogleIdUniqueKey" UNIQUE (googleId);
    END IF;
END $$;

-- 3) password y fechaNacimiento opcionales (DROP NOT NULL es idempotente:
--    aplicarlo sobre una columna ya opcional no produce error).
ALTER TABLE "User" ALTER COLUMN password DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN fechaNacimiento DROP NOT NULL;
