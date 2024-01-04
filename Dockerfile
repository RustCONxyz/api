# Base Image

FROM node:20-alpine AS base

ENV PNPM_HOME="/pnpm"

ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml /app/

# App Dependencies 

FROM base AS deps

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Build App

FROM base AS builder

COPY . /app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm run build

# Production Image

FROM base

ENV NODE_ENV production

RUN apk add --no-cache bash curl && \
    curl -1sLf "https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.alpine.sh" | bash && \
    apk add infisical

COPY --from=deps /app/node_modules /app/node_modules

COPY --from=builder /app/dist /app/dist

EXPOSE 3000

CMD ["infisical", "run", "--env=prod", "node", "dist/index.js"]
