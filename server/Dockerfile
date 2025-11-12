# syntax=docker/dockerfile:1

FROM node:20-slim AS base
WORKDIR /app

COPY package*.json ./
RUN npm install --production=false
COPY tsconfig.json ./
COPY src ./src

RUN npm run build

FROM node:20-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY --from=base /app/package*.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/index.js"]

