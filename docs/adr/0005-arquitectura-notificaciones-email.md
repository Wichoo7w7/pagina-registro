# ADR 0005: Arquitectura de Notificaciones por Email

## Estado
Aceptado

## Contexto
El sistema requiere distintos tipos de correos (verificación, reset, pagos, workshops). Se necesita plantillas reutilizables, registro de envíos y soporte multilenguaje futuro.

## Decisión
- Handlebars para plantillas (layout + parciales + fallback de idioma).
- Juice para inlining de CSS.
- EmailLog persistiendo estado/envíos.
- Bull + Redis para procesar asincrónicamente.

## Consecuencias
- Aumento de complejidad (templates + cola).
- Escalabilidad y resiliencia mejoradas (reintentos, logging, trazabilidad).
- Facilidad de añadir nuevos tipos de emails y proveedores alternos.
