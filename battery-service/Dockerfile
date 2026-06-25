FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .

# Run a quick cimpile here to download the gRPC plugins first
RUN mvn dependency:go-offline || true
COPY src ./src
RUN mvn clean package -Dmaven.test.skip=true

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

# Expose both the HTTP port and the gRPC port
EXPOSE 8082 8092
ENTRYPOINT ["java", "-jar", "app.jar"]