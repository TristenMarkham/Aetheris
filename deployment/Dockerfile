```Dockerfile
# Node.js Backend Build Stage
FROM node:14.15.4-alpine as backend
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# React Frontend Build Stage
FROM node:14.15.4-alpine as frontend
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage with Nginx
FROM nginx:1.19.6-alpine as production
COPY --from=backend /app/build /usr/share/nginx/html/backend
COPY --from=frontend /app/build /usr/share/nginx/html/frontend
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Security Configurations
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -G appgroup -u 1001 && \
    chown -R appuser:appgroup /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html
USER appuser

# Optimized Image Size
RUN apk add --no-cache --virtual .build-deps && \
    rm -rf /var/cache/apk/*

# Health Checks
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD [ "curl", "localhost" ] || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Please note that this is a basic Dockerfile and may need to be adjusted based on the specific needs of your application. For example, you may need to adjust the paths where the build outputs are copied from and to, or you may need to add additional build steps or dependencies. You may also need to adjust the health check command based on how your application's health can be verified.