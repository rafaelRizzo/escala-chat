FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml* yarn.lock* package-lock.json* .npmrc* ./

RUN npm install -g pnpm && pnpm install --frozen-lockfile --allow-scripts

COPY . .

RUN pnpm build || npm run build

FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY package.json pnpm-lock.yaml* yarn.lock* package-lock.json* .npmrc* ./

RUN npm install -g pnpm && pnpm install --frozen-lockfile --allow-scripts --prod

COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/public /app/public

ENV NODE_ENV=production

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
