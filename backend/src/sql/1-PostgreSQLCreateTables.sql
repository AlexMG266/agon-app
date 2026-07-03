
DROP TABLE IF EXISTS "User";

CREATE TABLE "User" (
    id BIGSERIAL NOT NULL,
    elo INTEGER NOT NULL,
    nombre VARCHAR(60) NOT NULL,
    email VARCHAR(120) NOT NULL,
    imagenPerfil VARCHAR(255),
    password VARCHAR(60) NOT NULL,
    fechaNacimiento DATE NOT NULL,
    CONSTRAINT UserPK PRIMARY KEY (id),
    CONSTRAINT UserNombreUniqueKey UNIQUE (nombre)
);

CREATE INDEX UserIndexByNombre ON "User" (nombre);
