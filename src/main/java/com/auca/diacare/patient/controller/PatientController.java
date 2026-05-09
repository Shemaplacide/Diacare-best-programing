package com.auca.diacare.patient.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

import com.auca.diacare.patient.dto.PatientDTO;
import com.auca.diacare.patient.model.Patient;
import com.auca.diacare.patient.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/patients")
@Tag(name = "Patients", description = "Patient profile management")
@SecurityRequirement(name = "bearerAuth")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @Operation(summary = "Create patient profile")
    @PostMapping
    public ResponseEntity<Patient> register(@Valid @RequestBody PatientDTO dto) {
        Patient patient = new Patient();
        patient.setDiabetesType(dto.getDiabetesType());
        patient.setDateOfBirth(dto.getDateOfBirth());
        patient.setGender(dto.getGender());
        patient.setTargetHbA1c(dto.getTargetHbA1c());
        // user will be set in the service layer after fetching the authenticated user
        // details
        Patient registeredPatient = patientService.registerPatient(patient);
        return ResponseEntity.ok(registeredPatient);

    }

    @Operation(summary = "Get my profile", description = "Returns the patient profile of the currently authenticated user")
    @GetMapping("/me")
    public ResponseEntity<Patient> getMyProfile(Authentication authentication) {
        String email = authentication.getName();
        return patientService.getPatientByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Get patient by public ID")
    @GetMapping("/{publicId}")
    public ResponseEntity<Patient> getPatientByPublicId(@PathVariable UUID publicId) {
        return patientService.getPatientByPublicId(publicId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "List all patients")
    @GetMapping("/all")
    public ResponseEntity<List<Patient>> getAllPatients() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }

    @Operation(summary = "Update patient profile")
    @PutMapping("/{publicId}")
    public ResponseEntity<Patient> updatePatientProfile(@PathVariable UUID publicId,
            @Valid @RequestBody PatientDTO dto) {
        Patient patientDetails = new Patient();
        patientDetails.setDiabetesType(dto.getDiabetesType());
        patientDetails.setDateOfBirth(dto.getDateOfBirth());
        patientDetails.setGender(dto.getGender());
        patientDetails.setTargetHbA1c(dto.getTargetHbA1c());
        Patient updatedPatient = patientService.updatePatientProfile(publicId, patientDetails);
        return ResponseEntity.ok(updatedPatient);
    }

    private PatientDTO convertToDTO(Patient patient) {
        PatientDTO dto = new PatientDTO();
        dto.setDiabetesType(patient.getDiabetesType());
        dto.setDateOfBirth(patient.getDateOfBirth());
        dto.setGender(patient.getGender());
        dto.setTargetHbA1c(patient.getTargetHbA1c());
        return dto;
    }
}
