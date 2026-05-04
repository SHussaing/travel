# -------- Build stage --------
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /build

# Copy full project
COPY . .

# Build ONLY gateway-service
RUN mvn -pl services/gateway-service -am clean package -DskipTests


# -------- Runtime stage --------
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

RUN apk add --no-cache curl

RUN addgroup -g 1001 -S travelms && \
    adduser -u 1001 -S travelms -G travelms

# Copy correct jar
COPY --from=build /build/services/gateway-service/target/*.jar app.jar

RUN chown -R travelms:travelms /app

USER travelms

EXPOSE 9080

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f -k https://localhost:9080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
