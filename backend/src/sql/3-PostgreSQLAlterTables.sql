-- Migration: Increase imagenPerfil column size to support base64 images
ALTER TABLE "User" ALTER COLUMN imagenPerfil TYPE TEXT;
