# Esquema de Base de Datos (TypeORM + PostgreSQL)

## Entidades y relaciones

- User (users)
  - id (uuid PK)
  - email (único, dominio umg.edu.gt)
  - password (hash bcrypt)
  - isVerified (bool)
  - verificationToken (nullable)
  - resetToken (nullable)
  - studentProfile (OneToOne -> StudentProfile)
  - roles (ManyToMany -> Role, join table user_roles)
  - timestamps + soft delete

- StudentProfile (student_profiles)
  - id
  - nombreCompleto
  - carnet (único)
  - facultad
  - telefono (nullable)
  - user (OneToOne inverso)
  - timestamps + soft delete

- Role (roles)
  - id
  - name (enum: admin, student, único)
  - description
  - users (inverso ManyToMany)
  - timestamps + soft delete

- Payment (payments)
  - id
  - boletaNumber (único)
  - boletaDate (date)
  - boletaImage (ruta)
  - status (enum: pending, approved, rejected)
  - rejectionReason (nullable)
  - user (ManyToOne)
  - timestamps + soft delete

- Workshop (workshops)
  - id
  - nombre (index)
  - descripcion
  - instructor
  - cupoMaximo
  - cuposDisponibles
  - fechaInicio / fechaFin
  - horario
  - lugar
  - activo (index)
  - timestamps + soft delete

- Enrollment (enrollments)
  - id
  - qrCode (único)
  - qrToken (payload cifrado QR)
  - attendance (bool)
  - attendanceAt (timestamp nullable)
  - enrollmentDate
  - user (ManyToOne)
  - workshop (ManyToOne)
  - índice compuesto (userId, workshopId)
  - timestamps + soft delete

## Índices adicionales
- UQ_user_email
- UQ_student_carnet
- UQ_payment_boleta_number
- UQ_enrollment_qrcode
- IDX_workshop_nombre
- IDX_workshop_activo
- IDX_enrollment_user_workshop

## Migraciones
- Migración inicial: `1700000000000-InitSchema.ts`

## Comandos npm
```
npm install
npm run build
npm run dev
npm run migration:run
npm run migration:revert
npm run seed
```

## Seed
- Crea roles (admin, student) si no existen.
- Crea usuario admin (ver variables en `.env.example`).

## Validaciones
- Email restringido a dominio umg.edu.gt mediante regex en entidad User.
- Longitudes y unicidad gestionadas por columnas e índices.

## Soft Delete
- Campo `deletedAt` en todas las tablas (heredado de BaseEntityWithTimestamps). Para excluir registros borrados lógicamente usar filtros en repositorios o QueryBuilder (`where deletedAt IS NULL`).

## Notas de implementación
- No se activa `synchronize` (usar migraciones para cambios).
- Añada nuevas migraciones con `npm run migration:create` o `migration:generate` (revisar manualmente antes de ejecutar en producción).

## Próximas mejoras sugeridas
- Agregar auditoría (tabla de logs de cambios o triggers).
- Implementar transacciones en operaciones críticas (ej: inscripción + decremento de cupos).
- Añadir constraint para evitar `cuposDisponibles > cupoMaximo` mediante trigger o validación de servicio.

## Módulo de Pagos
Endpoints (prefijo /api si global):
| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| POST | /payments | student | Cargar boleta (file + datos) |
| GET | /payments | admin | Listado con filtros (status, userId, dateFrom, dateTo) |
| GET | /payments/my-payments | student | Pagos del usuario autenticado |
| PATCH | /payments/:id/approve | admin | Aprueba un pago |
| PATCH | /payments/:id/reject | admin | Rechaza un pago con razón |

Validaciones de archivo: PDF/JPG/PNG, máx 5MB. Nombre almacenado con UUID en `uploads/payments/`.

Eventos emitidos:
- `payment.approved`
- `payment.rejected`

Notificaciones por email usando `EmailService`.


---

## Módulo de Talleres

### Endpoints
| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| POST | /workshops | admin | Crear taller |
| GET | /workshops | público | Listar talleres con filtros (activo, fecha desde/hasta, disponible) |
| GET | /workshops/:id | público | Obtener detalle + si usuario inscrito (si autenticado) |
| PATCH | /workshops/:id | admin | Actualizar taller |
| DELETE | /workshops/:id | admin | Soft delete del taller |
| POST | /workshops/:id/enroll | student | Inscribirse en un taller activo con cupos |
| GET | /enrollments/my-enrollments | student | Ver inscripciones del usuario |

### Reglas de Negocio
- Solo talleres `activo = true` aceptan inscripciones.
- Control de cupos: se decrementa `cuposDisponibles` al crear inscripción y se valida que sea > 0.
- (Futuro) Validación de pago aprobado antes de inscribir si se exige boleta vinculada.
- No permite duplicar inscripción (índice lógico por búsqueda previa).

### QR y Asistencia
- Cada inscripción genera `qrCode` (UUID/aleatorio) y un `qrToken` cifrado AES-256-GCM que encapsula: enrollmentId, userId, workshopId, timestamp.
- `QrService` expone generación y decodificación segura (clave derivada SHA-256 de `QR_SECRET_KEY`).
- `validateQR` decodifica y valida existencia de la inscripción.
- `updateAttendance` marca asistencia una única vez y registra `attendanceAt`.

### Estadísticas (Dashboard Admin)
`getWorkshopStats` devuelve:
```
{
  total,
  activos,
  completados,
  proximos,
  ocupacionPromedio // porcentaje agregado (0..1, redondeado 2 decimales)
}
```

### Filtros `GET /workshops`
Parámetros opcionales:
- `activo=true|false`
- `desde=YYYY-MM-DD`
- `hasta=YYYY-MM-DD`
- `disponible=true` (filtra cuposDisponibles > 0)

### Próximas mejoras sugeridas Talleres
- Transacción al inscribir (decremento de cupos + create enrollment atómico).
- Integrar validación de pago aprobado enlazando Payment -> Enrollment / Workshop.
- Endpoint para generar PNG/DataURL de QR para descarga.
- Auditoría de cambios en talleres (historial).
- Espera activa (lock optimista) para alta concurrencia en cupos.

## Módulo Administrativo (Dashboard)

### Endpoints
| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| GET | /admin/stats/general | admin | Totales generales del sistema |
| GET | /admin/stats/payments | admin | Distribución y serie temporal de pagos |
| GET | /admin/stats/workshops | admin | Inscripciones y ocupación por taller |
| GET | /admin/stats/users | admin | Registros por fecha y facultad |
| GET | /admin/export/:entity?format=csv|xlsx | admin | Exportar datos (users, payments, workshops, enrollments) |

### Estadísticas
- General: Conteo de usuarios, talleres, pagos, inscripciones.
- Pagos: Distribution (pending/approved/rejected) + serie diaria con aprobados y rechazados.
- Talleres: Inscritos, cupos usados, ocupación (usados / cupoMaximo) por taller.
- Usuarios: Serie temporal de registros y ranking de facultades.

### Exportación
- Formatos soportados: CSV (UTF-8 BOM) y XLSX.
- Filtros comunes: from (ISO date), to (ISO date); payments admite status.
- Columnas clave seleccionadas para tamaño ligero.

### Auditoría
- Tabla `audit_logs` registra entity, action, detalles, usuario e IP (si se incorpora en futuro al request context).
- Acciones auditadas: view stats y export.

### Seguridad
- `@Roles('admin')` + JwtAuthGuard + RolesGuard.
- Se puede ajustar Throttle en endpoints de stats (ejemplo aplicado en general).

### Mejoras Futuras Admin
- Cache de métricas (Redis) para reducir carga.
- Exportación incremental / paginada para datasets grandes.
- Firma digital/verificación hash de archivos exportados.
- Dashboard Websocket para métricas en tiempo real.

## Módulo de Autenticación (NestJS)

### Endpoints
| Método | Ruta | Público | Descripción |
|--------|------|---------|-------------|
| POST | /api/auth/register | Sí | Registro de usuario estudiante |
| POST | /api/auth/login | Sí (rate limited) | Genera JWT |
| GET | /api/auth/verify-email?token= | Sí | Verifica correo |
| POST | /api/auth/forgot-password | Sí (rate limited) | Envía email reset |
| POST | /api/auth/reset-password | Sí | Cambia contraseña |
| GET | /api/auth/me | No | Datos del usuario autenticado |

### Seguridad
- Rate limiting aplicado en login y forgot-password.
- Password requiere: 1 mayúscula, 1 minúscula, 1 número, 1 símbolo, >=10 caracteres.
- Tokens JWT con expiración configurable (`JWT_EXPIRES_IN`).
- Emails de verificación y reset con tokens UUID almacenados en DB.

### Variables relevantes (.env)
```
JWT_SECRET=...
JWT_EXPIRES_IN=15m
PASSWORD_PEPPER=
SMTP_HOST=...
SMTP_USER=...
SMTP_PASSWORD=...
THROTTLE_LOGIN_LIMIT=5
THROTTLE_LOGIN_TTL=60
```

### Flujo de Registro
1. Usuario envía datos.
2. Se valida email dominio umg.edu.gt y fortaleza de password.
3. Se crea usuario + perfil + token verificación.
4. Email de verificación se enqueuea y envía.

### Flujo de Reset Password
1. Usuario solicita reset (si existe se genera token y se envía email, se responde siempre igual para evitar enumeración).
2. Usuario envía token + nueva contraseña.
3. Se verifica token y se hashea la nueva contraseña.

### Extender Roles
Agregar nuevo valor al enum `RoleName`, migración para modificar enum en Postgres, seed actualizando roles.

### Próximas mejoras sugeridas Auth
- Refresh tokens y lista de revocación.
- 2FA (TOTP) para administradores.
- Integración con un servicio de colas (Bull + Redis) para emails a escala.

---

## Sistema de Notificaciones (Emails Profesionales)

### Arquitectura
- Cola Bull (`emails`) respaldada por Redis (`REDIS_HOST`, `REDIS_PORT`, password opcional).
- Productores: métodos de `EmailService` (verificación, reset, pago aprobado/rechazado, inscripción) agregan jobs a la cola.
- Consumidor: `EmailProcessor` procesa cualquier tipo (`@Process('*')`), renderiza plantilla Handlebars, envía vía nodemailer y registra resultado en tabla `email_logs`.
- Plantillas responsive con `layout.hbs`, parciales (`header`, `footer`) y archivos específicos: `verification.hbs`, `reset.hbs`, `payment-approved.hbs`, `payment-rejected.hbs`, `enrollment.hbs`, `generic.hbs`.
- CSS inline mediante `juice` para compatibilidad con clientes de correo.

### Entidad `EmailLog`
Campos principales:
- to, subject, type
- status (pending, sent, failed)
- attempts (intentos realizados por Bull)
- lastError (último mensaje de error si fracaso)
- meta (JSON con datos dinámicos + HTML si `EMAIL_DEV_PREVIEW=true`)

### Variables de Entorno Clave
```
REDIS_HOST=localhost
REDIS_PORT=6379
# REDIS_PASSWORD=
EMAIL_DEV_PREVIEW=false   # true = no envía correos, sólo guarda HTML en meta
SMTP_HOST=...
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=...
SMTP_PASSWORD=...
EMAIL_FROM="Registro Estudiantes <no-reply@example.com>"
```

### Flujo de Envío
1. Capa de aplicación invoca `emailService.sendXEmail(...)`.
2. Se crea job Bull con payload (tipo + datos).
3. Processor recupera job, elige plantilla según tipo, renderiza y envía.
4. Se actualiza `email_logs` con estado final (SENT o FAILED). Reintentos automáticos (exponencial, 5 intentos).

### Modo Preview
Activar `EMAIL_DEV_PREVIEW=true` para ambientes locales: no se conecta a SMTP ni envía, se almacena el HTML en `email_logs.meta.preview=true`.

### Extensión / Multi-proveedor
Diseñado para futura abstracción: se puede añadir un `ProviderRegistry` o fallback a otro transporter (SendGrid API, SES) en caso de error.

### Próximas mejoras sugeridas Notificaciones
- Internacionalización: subcarpetas `templates/es`, `templates/en` y selección por preferencia usuario.
- Soporte de adjuntos en jobs (extender `data`).
- Métricas Prometheus (tiempos de render/envío, tasa de error).
- Circuit breaker para SMTP primario y fallback dinámico.


