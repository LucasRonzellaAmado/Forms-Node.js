# ============================================================
# DOCKERFILE - Entenda sua Bexiga
# ============================================================
# Opcional: use isso se preferir rodar via Docker (ex: no seu
# homelab, ou em qualquer plataforma que aceite um Dockerfile,
# como Railway/Fly.io). Para o Render via render.yaml, o
# Dockerfile NAO e necessario (o Render builda direto com Node).
# ============================================================

FROM node:20-alpine

WORKDIR /app

# Copia so os arquivos de dependencia primeiro (cache do Docker
# so reinstala os pacotes quando package.json muda de verdade).
COPY package*.json ./
RUN npm install --omit=dev

# Copia o restante do projeto
COPY . .

# Garante que as pastas de dados/logs existam dentro do container
RUN mkdir -p data logs

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "src/server.js"]
