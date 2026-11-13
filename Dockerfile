# ---------- Etapa 1: compilación ----------
FROM node:22-bookworm-slim AS build
WORKDIR /app

# Vite incrusta las variables VITE_* al compilar: en Dokploy se pasan como Build Args
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Etapa 2: servidor estático ----------
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
