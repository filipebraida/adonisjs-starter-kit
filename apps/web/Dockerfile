FROM node:22-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app

RUN npm install -g corepack@latest
RUN corepack enable pnpm

COPY . .

ENV CI=true
RUN pnpm install --force --frozen-lockfile

WORKDIR /app/apps/web

RUN node ace build

WORKDIR /app/apps/web/build

EXPOSE 3333

CMD ["node", "bin/server.js"]
