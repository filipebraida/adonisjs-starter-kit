# syntax=docker/dockerfile:1.4
FROM node:22-alpine

# Instala bibliotecas básicas (se necessário)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Instala corepack e habilita pnpm
RUN npm install -g corepack@latest
RUN corepack enable pnpm

# Copia todo o monorepo para /app
COPY . .

# Instala TODAS as dependências (dev + prod)
ENV CI=true
RUN pnpm install --force --frozen-lockfile

# Caso seu AdonisJS esteja em /app/apps/web:
WORKDIR /app/apps/web

# Gera o build
RUN node ace build

# Retorna para /app para rodar a aplicação
WORKDIR /app/apps/web/build

# Expõe a porta padrão do AdonisJS (ajuste conforme seu .env)
EXPOSE 3333

# Se a saída do build gerar /build/bin/server.js, rode-o:
CMD ["node", "bin/server.js"]
