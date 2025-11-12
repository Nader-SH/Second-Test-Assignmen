# syntax=docker/dockerfile:1

FROM node:20-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY tsconfig.json vite.config.ts ./
COPY index.html ./
COPY src ./src
COPY public ./public

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

