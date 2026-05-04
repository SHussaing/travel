# -------- Build stage --------
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /build

# Copy full Maven project
COPY . .

# Build ONLY user-service
RUN mvn -pl services/user-service -am clean package -DskipTests


# -------- Runtime stage --------
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

RUN apk add --no-cache curl

RUN addgroup -g 1001 -S travelms && \
    adduser -u 1001 -S travelms -G travelms

# Copy correct jar
COPY --from=build /build/services/user-service/target/*.jar app.jar

RUN chown -R travelms:travelms /app

USER travelms

# Port (matches your Spring config default)
EXPOSE 9082

# Optional JVM tuning (safe baseline)
ENV JAVA_OPTS="-Xms256m -Xmx512m"

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:9082/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]