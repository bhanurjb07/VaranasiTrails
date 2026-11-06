# Builds the admin panel and serves it with nginx. /api is proxied to the API.
FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# The "Open public site" links point at the public website's address.
ARG VITE_PUBLIC_SITE_URL=http://localhost:8080
ENV VITE_PUBLIC_SITE_URL=$VITE_PUBLIC_SITE_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
