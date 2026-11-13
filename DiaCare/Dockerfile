FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml ./
COPY src ./src

RUN mvn -q -DskipTests package
RUN set -e; JAR_FILE=$(ls target/*.jar | grep -v '\\.original$' | head -n 1); cp "$JAR_FILE" target/app.jar

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=build /app/target/app.jar app.jar

# Fit the JVM in a 512 MB instance (Render Free). Override JAVA_TOOL_OPTIONS for larger hosts.
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=70 -XX:+UseSerialGC -Xss512k -XX:TieredStopAtLevel=1"

# The app listens on $PORT when the host provides it, otherwise on 8085.
EXPOSE 8085

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
