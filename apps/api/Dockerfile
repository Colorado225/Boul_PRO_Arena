# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS builder
WORKDIR /app
ENV DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build?sslmode=disable \
    DIRECT_URL=postgresql://build:build@127.0.0.1:5432/build?sslmode=disable
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/domain/package.json packages/domain/package.json
COPY packages/ui/package.json packages/ui/package.json
RUN npm ci
COPY apps/api apps/api
COPY packages/config packages/config
COPY packages/domain packages/domain
RUN npm run db:generate && npm run build -w @boul/domain && npm run build -w @boul/api

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production API_PORT=3001 OPENAPI_ENABLED=false
RUN apk add --no-cache tini
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/packages/domain/dist ./packages/domain/dist
COPY --from=builder /app/packages/domain/package.json ./packages/domain/package.json
USER node
EXPOSE 3001
ENTRYPOINT ["/sbin/tini","--"]
CMD ["node","apps/api/dist/main.js"]
