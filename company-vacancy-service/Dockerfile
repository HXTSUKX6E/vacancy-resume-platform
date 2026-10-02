# syntax=docker/dockerfile:1
# Этап сборки (12 факторов, V): артефакт собирается из исходников внутри образа
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build
COPY demo/pom.xml demo/checkstyle.xml* ./
RUN --mount=type=cache,target=/root/.m2 mvn -B -q dependency:go-offline
COPY demo/src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -B -q -DskipTests package

# Этап запуска: только JRE и собранный jar
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /build/target/company-vacancy-service.jar app.jar
USER app
ENV PORT=8083
EXPOSE 8083
HEALTHCHECK --interval=10s --timeout=3s --start-period=60s --retries=5   CMD wget -qO- http://localhost:${PORT}/actuator/health/readiness || exit 1
# exec-форма: JVM получает SIGTERM напрямую и корректно завершается (12 факторов, IX)
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
