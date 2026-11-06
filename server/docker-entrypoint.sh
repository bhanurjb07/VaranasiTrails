#!/bin/sh
set -e

# Bring the database schema up to date (a SQLite file on the mounted volume).
npx prisma migrate deploy

# Optional sample categories and trips (safe to repeat).
if [ "$SEED_ON_START" = "true" ]; then
  npx tsx src/scripts/seedDestinations.ts
fi

# The server itself creates/updates the admin when ADMIN_EMAIL + ADMIN_PASSWORD are set.
exec node dist/server.js
