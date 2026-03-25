# Stage 1: Build Frontend
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY CardTraderManager.Frontend/package*.json ./
RUN npm ci
COPY CardTraderManager.Frontend/ ./
RUN npm run build

# Stage 2: Build Backend
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /app
COPY . .
RUN dotnet publish CardTraderManager.Api/CardTraderManager.Api.csproj -c Release -o /app/out

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime

LABEL org.opencontainers.image.title="CardTraderManager"
LABEL org.opencontainers.image.description="Card price management tool for CardTrader with real-time monitoring, price analysis, and batch updates"
LABEL org.opencontainers.image.authors="Gianluca Florian"
LABEL org.opencontainers.image.source="https://github.com/Wookappa/CardTraderManager"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app
COPY --from=backend-build /app/out .
COPY --from=frontend-build /app/frontend/dist ./wwwroot
ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000
ENTRYPOINT ["dotnet", "CardTraderManager.Api.dll"]
