# ---- build stage ----
FROM node:22-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy manifests first for layer caching
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build the Analog SSR app
RUN pnpm exec nx build web --configuration=production

# ---- runtime stage ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Only bring in the server output and its deps
# Analog node-server preset outputs to dist/web/analog/
COPY --from=builder /app/dist/web/analog ./dist/web/analog

EXPOSE 8080

CMD ["node", "dist/web/analog/server/index.mjs"]
