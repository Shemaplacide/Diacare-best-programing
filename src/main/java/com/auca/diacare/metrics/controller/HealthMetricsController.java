package com.auca.diacare.metrics.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.auca.diacare.metrics.dto.HealthMetricsDTO;
import com.auca.diacare.metrics.dto.PatientDashboardResponse;
import com.auca.diacare.metrics.model.HealthMetrics;
import com.auca.diacare.metrics.service.HealthMetricsService;
import com.auca.diacare.patient.model.Patient;
import com.auca.diacare.patient.repository.PatientRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/metrics")
@Tag(name = "Health Metrics", description = "Track weight, BMI, HbA1c, blood pressure, cholesterol and view patient dashboard")
@SecurityRequirement(name = "bearerAuth")
public class HealthMetricsController {

    private final HealthMetricsService metricsService;
    private final PatientRepository patientRepository;

    public HealthMetricsController(HealthMetricsService metricsService, PatientRepository patientRepository) {
        this.metricsService = metricsService;
        this.patientRepository = patientRepository;
    }

    @Operation(summary = "Record health metrics", description = "BMI is auto-calculated from weight (kg) and height (cm)")
    @PostMapping
    public ResponseEntity<HealthMetrics> record(@RequestBody HealthMetricsDTO dto,
            Authentication authentication) {
        Patient patient = patientRepository.findByUserEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));

        HealthMetrics metrics = new HealthMetrics();
        metrics.setPatient(patient);
        metrics.setWeight(dto.getWeight());
        metrics.setHeight(dto.getHeight());
        metrics.setHba1c(dto.getHba1c());
        metrics.setBloodPressureSystolic(dto.getBloodPressureSystolic());
        metrics.setBloodPressureDiastolic(dto.getBloodPressureDiastolic());
        metrics.setCholesterol(dto.getCholesterol());
        metrics.setRecordedAt(dto.getRecordedAt());

        return ResponseEntity.ok(metricsService.recordMetrics(metrics));
    }

    @Operation(summary = "Get latest metrics snapshot")
    @GetMapping("/latest")
    public ResponseEntity<HealthMetrics> getLatest(Authentication authentication) {
        return metricsService.getLatest(authentication.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Get full metrics history")
    @GetMapping("/history")
    public ResponseEntity<List<HealthMetrics>> getHistory(Authentication authentication) {
        return ResponseEntity.ok(metricsService.getHistory(authentication.getName()));
    }

    @Operation(summary = "Get patient dashboard", description = "Aggregates profile, glucose trend, metrics, appointments, prescriptions, notifications and overall health status")
    @GetMapping("/dashboard")
    public ResponseEntity<PatientDashboardResponse> getDashboard(Authentication authentication) {
        return ResponseEntity.ok(metricsService.getDashboard(authentication.getName()));
    }

    @Operation(summary = "Record health metrics for a specific patient (doctor use)")
    @PostMapping("/for-patient/{patientPublicId}")
    public ResponseEntity<HealthMetrics> recordForPatient(
            @PathVariable UUID patientPublicId,
            @RequestBody HealthMetricsDTO dto) {
        Patient patient = patientRepository.findByUser_PublicId(patientPublicId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        HealthMetrics metrics = new HealthMetrics();
        metrics.setPatient(patient);
        metrics.setWeight(dto.getWeight());
        metrics.setHeight(dto.getHeight());
        metrics.setHba1c(dto.getHba1c());
        metrics.setBloodPressureSystolic(dto.getBloodPressureSystolic());
        metrics.setBloodPressureDiastolic(dto.getBloodPressureDiastolic());
        metrics.setCholesterol(dto.getCholesterol());
        metrics.setRecordedAt(dto.getRecordedAt());

        return ResponseEntity.ok(metricsService.recordMetrics(metrics));
    }

    @Operation(summary = "Get all metrics records (doctor/admin use)")
    @GetMapping("/all")
    public ResponseEntity<List<HealthMetrics>> getAll() {
        return ResponseEntity.ok(metricsService.getAll());
    }

    @Operation(summary = "Delete a metrics record")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        metricsService.deleteMetrics(id);
        return ResponseEntity.noContent().build();
    }
}
