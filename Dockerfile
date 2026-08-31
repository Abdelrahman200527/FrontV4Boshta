# ---------- Build stage ----------
FROM node:22-alpine AS build
WORKDIR /app

# Build-time env vars (Vite inlines them at build time)
ARG VITE_API_URL
ARG VITE_API_USERNAME
ARG VITE_API_PASSWORD
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_USERNAME=$VITE_API_USERNAME
ENV VITE_API_PASSWORD=$VITE_API_PASSWORD

COPY package*.json ./
RUN npm ci || npm install

COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
