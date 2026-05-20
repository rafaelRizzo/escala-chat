FROM node:24-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG NEXT_PUBLIC_URL_API
ENV NEXT_PUBLIC_URL_API=$NEXT_PUBLIC_URL_API

RUN pnpm build

FROM node:24-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/public /app/public

ENV NODE_ENV=production

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["pnpm", "start"]
