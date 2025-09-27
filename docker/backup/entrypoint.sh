#!/usr/bin/env bash
set -euo pipefail

# Escribir cron job
CRON_SCHEDULE=${BACKUP_CRON_SCHEDULE:-"0 2 * * *"}
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-7}

# Exportar variables necesarias para el script de backup en el entorno del cron
printenv | grep -E 'POSTGRES_|PGPASSWORD|RETENTION|TZ' > /tmp/project_env || true

echo "${CRON_SCHEDULE} /app/backup.sh >> /var/log/cron.log 2>&1" > /tmp/cronjob
crontab /tmp/cronjob

# Lanzar un backup inicial al arrancar (opcional)
/app/backup.sh || echo "Backup inicial falló, continuará con cron"

touch /var/log/cron.log

# Mantener contenedor vivo mostrando logs
crond -f -l 2 &
TAIL_PID=$!

tail -f /var/log/cron.log &
wait ${TAIL_PID}
