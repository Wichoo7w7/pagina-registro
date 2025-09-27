-- Script de creación de extensiones necesarias
-- Se ejecuta automáticamente en la primera inicialización del contenedor si el volumen de datos está vacío

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- Para funciones criptográficas
CREATE EXTENSION IF NOT EXISTS uuid-ossp; -- Para generación de UUIDs
CREATE EXTENSION IF NOT EXISTS citext; -- Tipo de texto case-insensitive
-- Agregar aquí otras extensiones requeridas
