package com.auca.diacare.common.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@Tag(name = "Health", description = "Public liveness and database check for the hosting platform")
public class HealthController {

    private static final int DB_TIMEOUT_SECONDS = 2;
    private static final long MB = 1024L * 1024L;

    private final DataSource dataSource;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Operation(summary = "Health check", description = "Returns 200 when the API and its database answer, 503 when the database does not.")
    @GetMapping("/api/v1/health")
    public ResponseEntity<Map<String, Object>> health() {
        boolean databaseUp = isDatabaseUp();
        Runtime runtime = Runtime.getRuntime();

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", databaseUp ? "UP" : "DOWN");
        body.put("database", databaseUp ? "UP" : "DOWN");
        body.put("heapUsedMb", (runtime.totalMemory() - runtime.freeMemory()) / MB);
        body.put("heapMaxMb", runtime.maxMemory() / MB);

        return ResponseEntity.status(databaseUp ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE).body(body);
    }

    private boolean isDatabaseUp() {
        try (Connection connection = dataSource.getConnection()) {
            return connection.isValid(DB_TIMEOUT_SECONDS);
        } catch (Exception e) {
            return false;
        }
    }
}
