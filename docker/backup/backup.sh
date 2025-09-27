#!/usr/bin/env bash
set -euo pipefail

DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR=/backups
DB_NAME=${POSTGRES_DB}
HOST=${POSTGRES_HOST:-db}
PORT=${POSTGRES_PORT:-5432}
USER=${POSTGRES_USER}
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-7}

mkdir -p "${BACKUP_DIR}" || true
FILENAME="${BACKUP_DIR}/${DB_NAME}_${DATE}.sql.gz"

echo "[backup] Iniciando backup de ${DB_NAME} a ${FILENAME}" >&2

pg_dump -h "${HOST}" -p "${PORT}" -U "${USER}" -d "${DB_NAME}" --no-owner --no-acl | gzip > "${FILENAME}"

if [ $? -eq 0 ]; then
  echo "[backup] Backup completado: ${FILENAME}" >&2
else
  echo "[backup] Error en pg_dump" >&2
  exit 1
fi

# Rotación
find "${BACKUP_DIR}" -type f -name "${DB_NAME}_*.sql.gz" -mtime +"${RETENTION_DAYS}" -print -delete 2>/dev/null || true

echo "[backup] Rotación completada. Retención: ${RETENTION_DAYS} días" >&2
