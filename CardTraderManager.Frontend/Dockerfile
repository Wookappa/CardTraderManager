# Use Node.js for building the frontend
FROM node:18 AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Entrypoint script to inject runtime config from env vars
RUN printf '#!/bin/sh\n\
if [ -n "$API_BASE_URL" ] || [ -n "$WS_URL" ]; then\n\
  echo "{\\"apiBaseUrl\\": \\"${API_BASE_URL}\\", \\"wsUrl\\": \\"${WS_URL}\\"}" > /usr/share/nginx/html/config.json\n\
fi\n\
exec nginx -g "daemon off;"\n' > /docker-entrypoint-custom.sh && chmod +x /docker-entrypoint-custom.sh

EXPOSE 80
CMD ["/docker-entrypoint-custom.sh"]