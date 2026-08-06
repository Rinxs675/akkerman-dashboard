# Multi-stage Docker build for Akkermann Dashboard

# Stage 1: Build Vite frontend
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY server.js ./
COPY public ./public

# Directory for uploaded files persistence
RUN mkdir -p uploads

EXPOSE 3001

CMD ["node", "server.js"]
