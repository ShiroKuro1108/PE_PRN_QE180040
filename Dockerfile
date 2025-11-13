# Use the official .NET 8 runtime as base image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Use the .NET 8 SDK for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY ["PE.API/PE.API.csproj", "PE.API/"]
RUN dotnet restore "PE.API/PE.API.csproj"

# Copy all source code
COPY . .
WORKDIR "/src/PE.API"

# Build the application
RUN dotnet build "PE.API.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "PE.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage - runtime
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Set environment variable for port (use container env PORT if provided)
ENV ASPNETCORE_URLS=http://+:$PORT

ENTRYPOINT ["dotnet", "PE.API.dll"]
