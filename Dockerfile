# Stage 1: build the React app
FROM node:22-alpine AS frontend
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci || npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: build the Spring Boot jar, bundling the React build as static resources
FROM gradle:9-jdk21 AS backend
WORKDIR /app
COPY backend/ ./
COPY --from=frontend /app/dist/ src/main/resources/static/
RUN gradle bootJar -x test --no-daemon

# Stage 3: small runtime image (Amazon Corretto, same JDK family as local dev)
FROM amazoncorretto:21-alpine
WORKDIR /app
COPY --from=backend /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
