#!/usr/bin/env sh
set -eu

: "${1:?Usage: verify-backup.sh <encrypted-backup>}"
: "${BACKUP_ENCRYPTION_KEY:?BACKUP_ENCRYPTION_KEY is required}"
SOURCE="$1"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT INT TERM

openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -in "$SOURCE" -out "$WORK/restore.dump" -pass env:BACKUP_ENCRYPTION_KEY
pg_restore --list "$WORK/restore.dump" >/dev/null

if [ -n "${RESTORE_DATABASE_URL:-}" ]; then
  pg_restore --clean --if-exists --no-owner --no-acl --dbname="$RESTORE_DATABASE_URL" "$WORK/restore.dump"
  printf 'Restore test completed against the disposable target.\n'
else
  printf 'Backup integrity verified. Set RESTORE_DATABASE_URL to run a disposable restore test.\n'
fi
