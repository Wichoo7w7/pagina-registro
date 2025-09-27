# Guía de Desarrollo

## Estándar de Código
- TypeScript estricto (evitar any implícitos; activar --strict cuando sea posible).
- Componentes React en PascalCase y un archivo por componente.
- Hooks: prefijo `use`. Evitar lógica de negocio en componentes de presentación.
- Nombres descriptivos, evitar abreviaturas crípticas.
- Imports absolutos con aliases (`@components`, `@stores`).
- Evitar side-effects en módulos (excepto configuración explícita).

## Estilo
- ESLint + Prettier: ejecutar `npm run lint` y `npm run format` antes de abrir PR.
- Tailwind: agrupar clases semánticamente (layout | spacing | color | estado) cuando sea razonable.

## Commits
Usar convención tipo Conventional Commits:
```
<type>(scope?): <mensaje>
```
Tipos recomendados: feat, fix, docs, style, refactor, test, chore, ci.
Ejemplos:
```
feat(auth): agregar flujo de verificación email
fix(payments): corregir cálculo de monto total
```

## Pull Requests
Checklist sugerido:
- [ ] Lint sin errores
- [ ] Build pasa
- [ ] Tests (cuando existan) verdes
- [ ] Actualizada documentación si procede
- [ ] Screenshots de UI si cambia interfaz

## Rama y Flujo Git
- main: estable y desplegable.
- feature/<corta-descripcion>
- fix/<issue-id-opcional>
- release tags: vX.Y.Z

## Testing (Pendiente de Integrar)
- Backend: Jest (o Vitest) para services/controllers.
- Frontend: Vitest + Testing Library.
- E2E: Playwright / Cypress (futuro).

## Gestión de Estado
- Zustand para slices específicos (auth, ui). No usarlo como dumping ground global.
- Extraer selectores: `useAuthStore(s => s.user)` para minimizar renders.

## Manejo de Errores
- Backend: Filtros globales (HttpExceptionFilter) y logging estructurado.
- Frontend: Interceptores Axios + notificaciones UI.

## Seguridad
- Nunca loggear secretos.
- Validar input (DTOs + class-validator en NestJS).
- Rate limiting (pendiente) para endpoints sensibles.

## Performance Tips
- Lazy loading de rutas, splitting por página.
- Memorización (useMemo/useCallback) solo cuando hay evidencia de re-renders costosos.
- Índices DB para campos de filtro/búsqueda (ej: email, createdAt, status).

## Versionado y Releases
- Tags semánticos (semver). CHANGELOG (pendiente) podría generarse via conventional-changelog.

## Revisión de Código
- Revisar: legibilidad, seguridad, manejo de errores, transacciones DB si aplican.
- Evitar PRs gigantes (preferible < 400 líneas diff).

## Observabilidad (Futuro)
- Integrar Sentry (ya documentado) + métricas Prometheus.
- Correlación de request-id mediante middleware.
