# ========== Stage 1: Build ==========
FROM node:22-alpine AS builder

WORKDIR /app

ARG VITE_MAPBOX_TOKEN
ARG VITE_MAPBOX_STYLE

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# ========== Stage 2: Serve ==========
FROM nginx:alpine

# SPA 라우팅용 nginx 설정
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 결과물 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# k8s 권장: non-root, 8080 포트
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
