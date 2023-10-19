# App Dependencies 

FROM node:18-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

# Build App

FROM node:18-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN npm run build

# Production Image

FROM node:18-alpine AS runner

RUN apk add --no-cache bash curl && \
    curl -1sLf "https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.alpine.sh" | bash && \
    apk add infisical

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["infisical", "run", "--env=prod", "node", "dist/index.js"]
