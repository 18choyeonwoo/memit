### Stage 1: React 빌드
FROM node:20-alpine AS builder

WORKDIR /app

# 빌드 인자로 VITE 환경변수 주입
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

### Stage 2: Nginx로 정적 파일 서빙 (SPA 새로고침 404 방지)
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
