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
import com.auca.diacare.auth.model.Role;
import com.auca.diacare.auth.model.User;
import com.auca.diacare.auth.repository.UserRepository;
import com.auca.diacare.doctor.repository.DoctorRepository;
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
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    public PatientController(PatientService patientService, DoctorRepository doctorRepository, UserRepository userRepository) {
        this.patientService = patientService;
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
    }

    @Operation(summary = "Create patient profile")
    @PostMapping
    public ResponseEntity<Patient> register(@Valid @RequestBody PatientDTO dto) {
        Patient patient = new Patient();
        patient.setDiabetesType(dto.getDiabetesType());
        patient.setDateOfBirth(dto.getDateOfBirth());
        patient.setGender(dto.getGender());
        patient.setPhoneNumber(dto.getPhoneNumber());
        patient.setHasAllergies(Boolean.TRUE.equals(dto.getHasAllergies()));
        patient.setAllergyDetails(Boolean.TRUE.equals(dto.getHasAllergies()) ? dto.getAllergyDetails() : null);
        if (dto.getPreferredDoctorPublicId() != null) {
            patient.setPreferredDoctor(doctorRepository.findByUser_PublicId(dto.getPreferredDoctorPublicId())
                    .orElseThrow(() -> new RuntimeException("Preferred doctor not found")));
        }
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
    @PutMapping("/me")
    public ResponseEntity<Patient> updateMyProfile(Authentication authentication,
            @Valid @RequestBody PatientDTO dto) {
        Patient patient = patientService.getPatientByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));
        Patient patientDetails = new Patient();
        patientDetails.setDiabetesType(dto.getDiabetesType());
        patientDetails.setDateOfBirth(dto.getDateOfBirth());
        patientDetails.setGender(dto.getGender());
        patientDetails.setPhoneNumber(dto.getPhoneNumber());
        patientDetails.setHasAllergies(dto.getHasAllergies());
        patientDetails.setAllergyDetails(dto.getAllergyDetails());
        if (dto.getPreferredDoctorPublicId() != null) {
            patientDetails.setPreferredDoctor(doctorRepository.findByUser_PublicId(dto.getPreferredDoctorPublicId())
                    .orElseThrow(() -> new RuntimeException("Preferred doctor not found")));
        }
        Patient updatedPatient = patientService.updatePatientProfile(patient.getUser().getPublicId(), patientDetails);
        return ResponseEntity.ok(updatedPatient);
    }

    @Operation(summary = "Set patient target HbA1c", description = "Doctor/admin only. Patients can view this target but cannot set it.")
    @PutMapping("/{publicId}/target-hba1c")
    public ResponseEntity<Patient> updateTargetHbA1c(@PathVariable UUID publicId,
            @RequestBody java.util.Map<String, Object> body,
            Authentication authentication) {
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (currentUser.getRole() == Role.PATIENT) {
            throw new RuntimeException("Only a doctor or admin can set the target HbA1c");
        }
        Patient patient = patientService.getPatientByPublicId(publicId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        Object value = body.get("targetHbA1c");
        if (value == null || value.toString().isBlank()) {
            patient.setTargetHbA1c(null);
        } else {
            patient.setTargetHbA1c(Double.valueOf(value.toString()));
        }
        return ResponseEntity.ok(patientService.savePatient(patient));
    }

    @Operation(summary = "Update patient profile by public ID")
    @PutMapping("/{publicId}")
    public ResponseEntity<Patient> updatePatientProfile(@PathVariable UUID publicId,
            @Valid @RequestBody PatientDTO dto) {
        Patient patientDetails = new Patient();
        patientDetails.setDiabetesType(dto.getDiabetesType());
        patientDetails.setDateOfBirth(dto.getDateOfBirth());
        patientDetails.setGender(dto.getGender());
        patientDetails.setPhoneNumber(dto.getPhoneNumber());
        patientDetails.setHasAllergies(dto.getHasAllergies());
        patientDetails.setAllergyDetails(dto.getAllergyDetails());
        if (dto.getPreferredDoctorPublicId() != null) {
            patientDetails.setPreferredDoctor(doctorRepository.findByUser_PublicId(dto.getPreferredDoctorPublicId())
                    .orElseThrow(() -> new RuntimeException("Preferred doctor not found")));
        }
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
