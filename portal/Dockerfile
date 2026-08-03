FROM node:22-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_MODEL_SERVICE_URL=http://localhost:8000
ARG NEXT_PUBLIC_ESTIMATOR_URL=http://localhost:8001
ARG NEXT_PUBLIC_MARKET_URL=http://localhost:8080
ENV NEXT_PUBLIC_MODEL_SERVICE_URL=$NEXT_PUBLIC_MODEL_SERVICE_URL
ENV NEXT_PUBLIC_ESTIMATOR_URL=$NEXT_PUBLIC_ESTIMATOR_URL
ENV NEXT_PUBLIC_MARKET_URL=$NEXT_PUBLIC_MARKET_URL
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
RUN apk add --no-cache curl
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
