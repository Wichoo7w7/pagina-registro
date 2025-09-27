# Troubleshooting Guide

## Problemas Comunes
### 1. Backend no arranca (Error conexión DB)
- Verificar variables POSTGRES_* en `.env`.
- Asegurar contenedor `db` healthy: `docker compose ps`.
- Revisar logs: `docker compose logs db`.

### 2. Correos no se envían
- Revisar Redis en ejecución.
- Chequear logs de worker/processor.
- Verificar credenciales SMTP (puede usar Ethereal en dev).
- Confirmar que plantilla existe y nombre coincide con tipo.

### 3. Errores CORS en frontend
- Asegurar que backend incluye origen permitido.
- Revisar `VITE_API_BASE_URL` y que contenga `/api` si se espera.

### 4. Builds lentos
- Confirmar cache Docker (multi-stage) no se invalida por copiar toda la raíz antes de instalar.
- Mantener dependencias ordenadas y eliminar no usadas.

### 5. Memoria alta en Node
- Habilitar flags `--max_old_space_size` si necesario.
- Detectar fugas con heap snapshots (Chrome DevTools / node --inspect).

### 6. Queue llena o jobs fallando
- Revisar tamaño Redis y TTL.
- Implementar backoff y ver métricas de retries.
- Analizar `EmailLog.lastError`.

### 7. Archivos estáticos frontend no sirven
- Validar que build generó `frontend/dist`.
- Revisar configuración Nginx fallback en Dockerfile frontend.

## Debugging Técnicas
- Backend: usar Logger NestJS + `DEBUG=typeorm:*` para queries.
- Frontend: React DevTools + Network tab para revisar headers JWT.
- DB: `EXPLAIN ANALYZE` para optimizar queries pesadas.

## Optimización Performance
- Añadir índices en campos de búsqueda (email, status, created_at).
- Cache selectiva (Redis) para listados pesados de workshops.
- Evitar N+1 queries con relaciones adecuadas / joins.

## Sentry (si configurado)
- Confirmar DSN en variables prod/staging.
- Asociar release: `SENTRY_RELEASE=app@vX.Y.Z` y enviar source maps (frontend) en pipeline.

## Escalabilidad
- Separar worker de emails en despliegues mayores.
- Auto-scaling basado en longitud de cola.
- Uso de CDN para servir frontend estático.

## Seguridad Reforzada
- Activar Helmet y Rate limiting.
- Rotar `JWT_SECRET` periódicamente (mecanismo de key rollover futuro).
- Revisar dependencias críticas semanalmente (Dependabot ya configurado).
