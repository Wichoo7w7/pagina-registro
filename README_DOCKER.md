# Infraestructura Docker - Postgres + Backups (+ pgAdmin opcional)

Este entorno proporciona:

- PostgreSQL 15 con volumen persistente
- Scripts de inicialización para extensiones y datos seed
- Servicio de backups automáticos con rotación (cron configurable)
- pgAdmin 7 (solo en desarrollo o activable en producción opcionalmente)
- Separación de configuraciones dev/prod

## Estructura
```
./docker-compose.dev.yml
./docker-compose.prod.yml
./.env.example
./docker/postgres/init/01_extensions.sql
./docker/postgres/init/02_seed.sql
./docker/backup/Dockerfile
./docker/backup/entrypoint.sh
./docker/backup/backup.sh
./docker/backup/restore-example.sh
```

## Uso rápido

1. Copiar variables de entorno:
```
cp .env.example .env
```
2. Ajustar credenciales en `.env` (NO usar las de ejemplo en producción).
3. Levantar entorno de desarrollo:
```
docker compose -f docker-compose.dev.yml up -d --build
```
4. Acceder a:
   - Base de datos: localhost:`POSTGRES_PORT` (5432 por defecto)
   - pgAdmin: http://localhost:8080 (credenciales en `.env`)

## Producción

Levantar solo servicios necesarios:
```
docker compose -f docker-compose.prod.yml up -d --build
```

Para habilitar pgAdmin en producción descomente el bloque correspondiente en `docker-compose.prod.yml` y añada el volumen `pgadmin_data`.

## Backups

- Programados vía cron con la variable `BACKUP_CRON_SCHEDULE`.
- Guardados en un volumen nombrado (`postgres_backups` o `postgres_backups_dev`).
- Retención controlada por `BACKUP_RETENTION_DAYS`.
- Formato: `NOMBREDB_YYYYMMDD_HHMMSS.sql.gz`.

Ejecutar un backup manual:
```
docker compose -f docker-compose.dev.yml exec backup /app/backup.sh
```

Listar backups:
```
docker compose -f docker-compose.dev.yml exec backup ls -1 /backups
```

Restaurar (ejemplo):
```
docker compose -f docker-compose.dev.yml exec backup /app/restore-example.sh /backups/app_db_20240101_020000.sql.gz app_db
```

## Seguridad y buenas prácticas
- Cambiar inmediatamente las contraseñas por valores seguros.
- Limitar acceso a puertos en producción (usar firewall / security groups).
- Considerar activar at-rest encryption a nivel de disco/volumen.
- Realizar pruebas periódicas de restauración.
- Versionar sólo `.env.example`, nunca el `.env` con credenciales reales.

## Extensiones
Modificar `01_extensions.sql` para añadir más extensiones; se ejecuta solo si el volumen de datos está vacío.

## Variables de entorno clave
Ver `.env.example` para documentación de cada variable.

## Actualización de la imagen de Postgres
Para actualizar a una nueva versión menor:
1. Backup completo
2. Parar contenedores
3. Cambiar etiqueta de imagen (por ejemplo `postgres:15.5`)
4. Volver a levantar y validar

Para actualizaciones mayores considere `pg_dump` + restore en un volumen nuevo (ensayar antes en staging).

## Limpieza
Eliminar todos los contenedores y volúmenes de este stack (¡destruye datos!):
```
docker compose -f docker-compose.dev.yml down -v
```

## Troubleshooting
- Ver estado DB: `docker compose -f docker-compose.dev.yml ps`.
- Logs Postgres: `docker compose -f docker-compose.dev.yml logs db`.
- Logs backup: `docker compose -f docker-compose.dev.yml logs backup`.
- Comprobar cron dentro del contenedor backup: `docker compose -f docker-compose.dev.yml exec backup crontab -l`.

## Futuras mejoras sugeridas
- Añadir monitoreo (Prometheus + exporter de Postgres)
- Cifrado de backups con GPG o S3 server-side encryption (si se suben a la nube)
- Integrar herramienta de migraciones (Flyway, Liquibase, Prisma, etc.)

---
Hecho con buenas prácticas Docker para entornos consistentes.
