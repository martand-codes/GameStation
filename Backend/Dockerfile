# ── STAGE 1: BUILDER ──────────────────────────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

# Install openssl for Prisma CLI & compiler
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm ci

# Copy Prisma schema and generate client binaries
COPY src/prisma ./src/prisma
RUN npx prisma generate

# Copy source code and TypeScript config
COPY src ./src
COPY tsconfig.json ./

# Compile TypeScript to dist/
RUN npm run build

# Remove development dependencies to keep production footprint minimal
RUN npm prune --omit=dev

# ── STAGE 2: RUNTIME RUNNER ─────────────────────────────────────────
FROM node:22-slim AS runner

WORKDIR /app

# Install openssl for Prisma runtime engine
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

# Copy package definition and production dependencies
COPY package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/prisma ./src/prisma

# Expose backend API & WebSocket port
EXPOSE 5000

# Run container as secure non-root user
USER node

CMD ["node", "dist/server.js"]

