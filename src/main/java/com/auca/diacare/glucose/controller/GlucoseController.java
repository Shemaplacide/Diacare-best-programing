package com.auca.diacare.glucose.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.auca.diacare.glucose.dto.GlucoseReadingDTO;
import com.auca.diacare.glucose.dto.GlucoseTrendResponse;
import com.auca.diacare.glucose.model.GlucoseReading;
import com.auca.diacare.glucose.service.GlucoseService;
import com.auca.diacare.patient.model.Patient;
import com.auca.diacare.patient.repository.PatientRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/glucose")
@Tag(name = "Glucose", description = "Blood glucose readings and trend analysis")
@SecurityRequirement(name = "bearerAuth")
public class GlucoseController {

    private final GlucoseService glucoseService;
    private final PatientRepository patientRepository;

    public GlucoseController(GlucoseService glucoseService, PatientRepository patientRepository) {
        this.glucoseService = glucoseService;
        this.patientRepository = patientRepository;
    }

    @Operation(summary = "Log a glucose reading", description = "MealContext values: FASTING, BEFORE_MEAL, AFTER_MEAL, BEDTIME, RANDOM. Unit values: MMOL_L, MG_DL")
    @PostMapping
    public ResponseEntity<GlucoseReading> log(@Valid @RequestBody GlucoseReadingDTO dto,
            Authentication authentication) {
        Patient patient = patientRepository.findByUserEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));

        GlucoseReading reading = new GlucoseReading();
        reading.setPatient(patient);
        reading.setValue(dto.getValue());
        reading.setUnit(dto.getUnit());
        reading.setMealContext(dto.getMealContext());
        reading.setRecordedAt(dto.getRecordedAt());
        reading.setNotes(dto.getNotes());

        return ResponseEntity.ok(glucoseService.logReading(reading));
    }

    @Operation(summary = "Get all my glucose readings")
    @GetMapping("/my")
    public ResponseEntity<List<GlucoseReading>> getMyReadings(Authentication authentication) {
        return ResponseEntity.ok(glucoseService.getMyReadings(authentication.getName()));
    }

    @Operation(summary = "Get all glucose readings (doctor/admin)")
    @GetMapping("/all")
    public ResponseEntity<List<GlucoseReading>> getAll() {
        return ResponseEntity.ok(glucoseService.getAllReadings());
    }

    @Operation(summary = "Get glucose trend analysis", description = "Returns 7/30-day averages, high reading counts, and risk level (LOW/MODERATE/HIGH)")
    @GetMapping("/my/trend")
    public ResponseEntity<GlucoseTrendResponse> getMyTrend(Authentication authentication) {
        return ResponseEntity.ok(glucoseService.getTrend(authentication.getName()));
    }

    @Operation(summary = "Get readings in date range", description = "Date format: 2024-01-15T08:00:00")
    @GetMapping("/my/range")
    public ResponseEntity<List<GlucoseReading>> getInRange(
            Authentication authentication,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        Patient patient = patientRepository.findByUserEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));
        return ResponseEntity.ok(glucoseService.getReadingsInRange(patient.getId(), from, to));
    }

    @Operation(summary = "Get reading by ID")
    @GetMapping("/{id}")
    public ResponseEntity<GlucoseReading> getById(@PathVariable Long id) {
        return glucoseService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Delete a glucose reading")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        glucoseService.deleteReading(id);
        return ResponseEntity.noContent().build();
    }
}
