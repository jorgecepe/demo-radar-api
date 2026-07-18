FROM node:20-alpine

WORKDIR /app

# Instalamos dependencias primero para aprovechar la cache de capas de Docker.
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Luego copiamos el codigo fuente.
COPY src ./src

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "src/index.js"]
