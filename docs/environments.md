# Entornos y Variables de Entorno

## Resumen de Entornos
| Entorno | Objetivo | Despliegue | Dominio Ejemplo |
|---------|----------|------------|-----------------|
| Development | Desarrollo local | docker-compose.dev.yml | localhost | 
| Staging | Pre-producción / QA | GitHub Actions -> Infra staging | staging.ejemplo.com |
| Production | Producción | GitHub Actions (tag release) | app.ejemplo.com |

## Variables Clave (Backend)
| Variable | Descripción |
|----------|-------------|
| NODE_ENV | environment: development / production |
| PORT | Puerto HTTP servicio backend |
| DATABASE_URL | Cadena conexión alternativa (opcional si se usan variables POSTGRES_*) |
| POSTGRES_DB / USER / PASSWORD / HOST / PORT | Config DB detallada |
| JWT_SECRET | Secreto JWT |
| EMAIL_HOST / PORT / USER / PASS | SMTP provider principal |
| EMAIL_FROM | Dirección remitente por defecto |
| REDIS_HOST / REDIS_PORT / REDIS_PASSWORD | Cola de emails (Bull) |
| SENTRY_DSN | (Opcional) Captura de errores |

## Variables Frontend (Vite)
| Variable | Descripción |
|----------|-------------|
| VITE_API_BASE_URL | URL base API (incluye /api) |
| VITE_APP_NAME | Nombre de la aplicación |
| VITE_FEATURE_FLAGS | Lista separada por comas (notifications,darkMode,...) |
| VITE_SENTRY_DSN | (Opcional) para reportar errores frontend |

## Archivos de Ejemplo
```
.env.example
.env.staging.example
.env.production.example
```

### .env.staging.example
```
NODE_ENV=production
PORT=3000
POSTGRES_DB=app_staging
POSTGRES_USER=app_user
POSTGRES_PASSWORD=staging_secret
POSTGRES_HOST=db
POSTGRES_PORT=5432
JWT_SECRET=change_me_staging
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=staging_user
EMAIL_PASS=staging_pass
EMAIL_FROM="Registro <no-reply@staging.ejemplo.com>"
REDIS_HOST=redis
REDIS_PORT=6379
SENTRY_DSN=
```

### .env.production.example
```
NODE_ENV=production
PORT=3000
POSTGRES_DB=app_prod
POSTGRES_USER=app_user
POSTGRES_PASSWORD=prod_secret
POSTGRES_HOST=db
POSTGRES_PORT=5432
JWT_SECRET=change_me_prod
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=sg_xxx
EMAIL_FROM="Registro <no-reply@app.ejemplo.com>"
REDIS_HOST=redis
REDIS_PORT=6379
SENTRY_DSN=
```

## Health Checks
Backend debe exponer `/health` retornando `{ status: 'ok', time, db: 'up', redis: 'up' }`.
Configura `HEALTHCHECK` en Dockerfile para automatizar.

Ejemplo pseudo NestJS:
```ts
@Get('health')
health() { return { status: 'ok', time: Date.now() }; }
```

## Logging
- Usar niveles: error, warn, info, debug.
- En producción: formato JSON estructurado.
- Integrable con agregadores (ELK / Loki).

## Seguridad Docker
- Imágenes base slim/alpine.
- Usuario no-root (implementado en backend Dockerfile).
- Minimizar capas y remover devDependencies.
- Añadir escaneo (Trivy) opcional en pipeline.

## Gestión de Secrets
- GitHub Actions: `Repository Secrets` / `Environment Secrets`.
- NO commitear .env reales.
- Rotación periódica de claves sensibles (JWT, SMTP).

## Monitoreo y Alertas (Opcional)
- Integrar Sentry (frontend/backend) con release tags.
- Métricas: Exponer `/metrics` (Prometheus) si se requiere escalado.

## Próximos Pasos
- Añadir job Trivy (scan) en pipeline.
- Añadir step para pruebas unitarias backend/frontend.
- Configurar despliegue Helm/Kubernetes (si aplica) o docker compose remoto.
