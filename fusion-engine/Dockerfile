# Build app using maven
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy source code and compile the .jar
COPY src ./src
RUN mvn clean package -Dmaven.test.skip=true

# Run the app in a lightweight JRE container
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy only the compile .jar from the builder
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]