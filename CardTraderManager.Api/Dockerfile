# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy all solution files
COPY . .

# Restore dependencies
RUN dotnet restore CardTraderManager.Api/CardTraderManager.Api.csproj

# Build the project
RUN dotnet publish CardTraderManager.Api/CardTraderManager.Api.csproj -c Release -o /app/out

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .
ENTRYPOINT ["dotnet", "CardTraderManager.Api.dll"]
