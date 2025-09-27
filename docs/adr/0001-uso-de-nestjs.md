# ADR 0001: Uso de NestJS para el Backend

## Estado
Aceptado

## Contexto
Se requiere un backend modular, escalable, con integración sencilla de autenticación, colas y ORM. Express puro implicaría más código repetitivo y decisiones dispersas.

## Decisión
Usar NestJS (sobre Node.js) por su arquitectura modular, inyección de dependencias, ecosistema maduro (Passport, TypeORM, Bull) y consistencia en pruebas.

## Consecuencias
- Curva de aprendizaje inicial mayor que Express.
- Estructura clara para equipos creciendo.
- Facilidad para añadir interceptores, filtros y pipes globales.
