# ── STAGE 1: BUILDER ──────────────────────────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# In production behind Nginx reverse-proxy, API and WebSockets use relative origin
ARG VITE_API_URL=/api
ARG VITE_WS_URL=/
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL

RUN npm run build

# ── STAGE 2: NGINX RUNNER ──────────────────────────────────────────
FROM nginx:alpine AS runner

# Copy compiled SPA dist from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Injected custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

