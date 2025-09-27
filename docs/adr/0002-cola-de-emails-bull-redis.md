# ADR 0002: Cola de Emails con Bull + Redis

## Estado
Aceptado

## Contexto
El envío de correos puede ser lento y propenso a fallos transitorios. Se necesita reintentos, logging y desacoplar la respuesta HTTP del envío.

## Decisión
Utilizar Bull (basado en Redis) para encolar trabajos de email. Cada job registra estado y permite reintentos con backoff.

## Consecuencias
- Requiere infraestructura Redis.
- Escalamiento horizontal sencillo (workers adicionales).
- Permite priorizar y monitorizar métricas de cola.
