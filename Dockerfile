# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Runtime stage - use bare Alpine for smaller image
FROM alpine:3.21 AS runner

# Install only Node.js runtime (no npm/yarn needed)
RUN apk --no-cache add nodejs

WORKDIR /app
ENV NODE_ENV=production

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Environment variables (set at runtime)
# SESSION_SECRET must be consistent across restarts. Generate once and save:
#   openssl rand -hex 32
# Save the output from this and use it for your session secret
# Then use: -e SESSION_SECRET=[your-session-secret]
ENV NEXT_PUBLIC_API_URL=http://localhost:1212

EXPOSE 3000
CMD ["node", "server.js"]

