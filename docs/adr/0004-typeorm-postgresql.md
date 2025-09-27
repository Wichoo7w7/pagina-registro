# ADR 0004: Uso de TypeORM con PostgreSQL

## Estado
Aceptado

## Contexto
Se necesita una base de datos relacional sólida con soporte avanzado (transacciones, indexing, JSON). Debe integrarse bien con NestJS y facilitar migraciones.

## Decisión
PostgreSQL como motor principal y TypeORM como ORM por su integración con NestJS, soporte de migraciones y decoradores.

## Consecuencias
- Mayor peso de modelo objeto-relacional vs mapeo manual.
- Simplifica generación y ejecución de migraciones.
- Posibilidad de caching, relaciones complejas y listeners (subscribers) futuros.
