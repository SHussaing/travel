# -------- Build stage --------
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /build

# Copy full project
COPY . .

# Build ONLY registry-service (Eureka)
RUN mvn -pl services/registry-service -am clean package -DskipTests


# -------- Runtime stage --------
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

RUN apk add --no-cache curl

RUN addgroup -g 1001 -S travelms && \
    adduser -u 1001 -S travelms -G travelms

# Copy correct jar
COPY --from=build /build/services/registry-service/target/*.jar app.jar

RUN chown -R travelms:travelms /app

USER travelms

EXPOSE 8761

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=5 \
  CMD curl -f http://localhost:8761/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]