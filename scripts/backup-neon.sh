#!/usr/bin/env sh
set -eu

: "${BACKUP_DATABASE_URL:?BACKUP_DATABASE_URL is required}"
: "${BACKUP_ENCRYPTION_KEY:?BACKUP_ENCRYPTION_KEY is required}"
: "${BACKUP_S3_BUCKET:?BACKUP_S3_BUCKET is required}"
: "${BACKUP_S3_ENDPOINT:?BACKUP_S3_ENDPOINT is required}"

STAMP="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
NAME="boul-neon-${STAMP}.dump"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT INT TERM

pg_dump "$BACKUP_DATABASE_URL" --format=custom --compress=9 --no-owner --no-acl --file="$WORK/$NAME"
pg_restore --list "$WORK/$NAME" >/dev/null
openssl enc -aes-256-cbc -salt -pbkdf2 -iter 200000 -in "$WORK/$NAME" -out "$WORK/$NAME.enc" -pass env:BACKUP_ENCRYPTION_KEY
sha256sum "$WORK/$NAME.enc" > "$WORK/$NAME.enc.sha256"

DESTINATION="s3://${BACKUP_S3_BUCKET}/neon/$(date -u +%Y/%m/%d)/"
aws s3 cp "$WORK/$NAME.enc" "$DESTINATION" --endpoint-url "$BACKUP_S3_ENDPOINT" --only-show-errors
aws s3 cp "$WORK/$NAME.enc.sha256" "$DESTINATION" --endpoint-url "$BACKUP_S3_ENDPOINT" --only-show-errors
printf 'Backup encrypted and uploaded: %s%s.enc\n' "$DESTINATION" "$NAME"
