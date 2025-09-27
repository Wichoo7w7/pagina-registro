# Registro de Estudiantes

Plataforma completa para gestión de estudiantes, pagos y talleres con backend NestJS, frontend React (Vite + TS), notificaciones por correo asincrónicas (Bull + Redis) y pipeline CI/CD profesional.

## Características Principales
- Autenticación JWT + flujo verificación / reset password.
- Gestión de pagos con revisión (upload comprobantes, aprobación/rechazo, logging emails).
- Gestión de talleres y matrículas, confirmaciones y QR (pendiente parte frontend avanzada).
- Sistema de notificaciones email (Bull queue, Handlebars, multi-template, logging persistente).
- Frontend profesional: Zustand, Tailwind, routing protegido, dark mode, tabla genérica, charts.
- CI/CD: Docker multi-stage, GitHub Actions (build, deploy staging/production), Dependabot.
- Documentación técnica (en `docs/`).

## Estructura del Repositorio (resumen)
```
├─ docker-compose.dev.yml
├─ docker-compose.prod.yml
├─ Dockerfile.backend
├─ frontend/
│  ├─ Dockerfile
│  ├─ src/
│  └─ ...
├─ docs/
│  ├─ environments.md
│  ├─ api/ (OpenAPI / Postman) *pendiente*
│  ├─ adr/ (Architecture Decision Records)
│  ├─ diagrams/
│  └─ troubleshooting.md
```

## Requisitos Previos
- Node.js 20+
- Docker / Docker Compose v2
- Redis (local o container) para cola de emails
- PostgreSQL 15

## Setup Rápido (Desarrollo)
```bash
# 1. Copiar variables
cp .env.example .env
# 2. Levantar infraestructura base (DB, pgAdmin, backup)
docker compose -f docker-compose.dev.yml up -d
# 3. Instalar dependencias backend & frontend
npm install
(cd frontend && npm install)
# 4. Ejecutar backend (NestJS típico)
npm run start:dev
# 5. Ejecutar frontend
cd frontend && npm run dev
```

## Variables de Entorno (Backend Clave)
| Variable | Descripción |
|----------|-------------|
| PORT | Puerto backend |
| POSTGRES_* | Config base de datos |
| JWT_SECRET | Secreto JWT |
| EMAIL_* | Config SMTP (host, puerto, user, pass, from) |
| REDIS_* | Config redis para cola |
| SENTRY_DSN | (Opcional) monitoreo errores |

Frontend (Vite): ver `frontend/.env.example`.

## Arranque Base de Datos & Migraciones

El archivo `docker-compose.dev.yml` ahora incluye:
- `db` (PostgreSQL 15)
- `redis` (cola Bull para emails)
- `mailhog` (captura SMTP en http://localhost:8025)
- `pgadmin` (http://localhost:8080) credenciales de `.env`
- `backup` (cron de dumps)
- `backend` (NestJS) – expone puerto 3000

Pasos recomendados primera vez:
```bash
# Asegúrate de tener .env en raíz y backend/.env (ya provisto)


# Verificar salud de la base
docker compose -f docker-compose.dev.yml ps

# Ejecutar migraciones (si backend no lo hace automáticamente)
docker compose -f docker-compose.dev.yml exec backend npm run migration:run

# (Opcional) seed inicial (roles y admin)
docker compose -f docker-compose.dev.yml exec backend npm run seed
```

Para revertir una migración:
```bash
docker compose -f docker-compose.dev.yml exec backend npm run migration:revert
```

Backups resultan en el volumen `postgres_backups_dev` dentro del contenedor `backup` (`/backups`). Se rota según `BACKUP_RETENTION_DAYS`.

### Conexión manual (psql)
```bash
docker compose -f docker-compose.dev.yml exec db psql -U $POSTGRES_USER -d $POSTGRES_DB
```

### Diagnóstico rápido
```bash
# Logs de backend
docker compose -f docker-compose.dev.yml logs -f backend

# Logs de Postgres
docker compose -f docker-compose.dev.yml logs -f db

# Inspectar jobs de email (necesitarías UI externa si deseas ver cola Bull)
```
## Scripts Comunes (Root / Backend)
| Script | Acción |
|--------|-------|
| start:dev | Inicia backend en modo desarrollo (si definido) |
| build | Compila backend a dist |
| test | (Agregar) pruebas unitarias |
| lint | Linter backend (si configurado) |

Frontend (`frontend/package.json`): `dev`, `build`, `preview`, `lint`, `format`, `typecheck`.

## CI/CD
- Build & test en PR y main.
- Deploy automático a staging (main) y production (tags `v*`).
- Imágenes multi-stage optimizadas, usuario no-root.

## Documentación Ampliada
Ver carpeta `docs/` para entornos, ADRs, diagramas, troubleshooting y especificación API.

## Licencia
MIT (o definir otra).
