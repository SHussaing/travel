# -------- Build stage --------
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /build

# Copy full project
COPY . .

# Build ONLY payment-service
RUN mvn -pl services/payment-service -am clean package -DskipTests


# -------- Runtime stage --------
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

RUN apk add --no-cache curl

RUN addgroup -g 1001 -S travelms && \
    adduser -u 1001 -S travelms -G travelms

# Copy correct jar
COPY --from=build /build/services/payment-service/target/*.jar app.jar

RUN chown -R travelms:travelms /app

USER travelms

EXPOSE 9084

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:9084/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]