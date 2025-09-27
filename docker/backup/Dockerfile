FROM alpine:3.20

RUN apk add --no-cache postgresql15-client bash tzdata curl ca-certificates coreutils shadow su-exec

# Crear usuario no root para seguridad
RUN useradd -ms /bin/bash backup

WORKDIR /app
COPY entrypoint.sh backup.sh restore-example.sh ./

RUN chmod +x /app/entrypoint.sh /app/backup.sh /app/restore-example.sh \
    && mkdir -p /backups \
    && chown -R backup:backup /backups /app

USER backup
ENV BACKUP_CRON_SCHEDULE="0 2 * * *" \
    BACKUP_RETENTION_DAYS=7 \
    POSTGRES_HOST=db \
    POSTGRES_PORT=5432

ENTRYPOINT ["/app/entrypoint.sh"]
