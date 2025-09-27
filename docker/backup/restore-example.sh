#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Uso: $0 archivo_backup.sql.gz [DATABASE]" >&2
  exit 1
fi

FILE=$1
DB_TARGET=${2:-$POSTGRES_DB}
HOST=${POSTGRES_HOST:-db}
PORT=${POSTGRES_PORT:-5432}
USER=${POSTGRES_USER}

if [ ! -f "$FILE" ]; then
  echo "Archivo no existe: $FILE" >&2
  exit 1
fi

echo "Restaurando backup $FILE en base de datos $DB_TARGET" >&2

gunzip -c "$FILE" | psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB_TARGET"

echo "Restauración completada" >&2
