package com.auca.diacare.doctor.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.transaction.annotation.Transactional;

import com.auca.diacare.auth.model.User;
import com.auca.diacare.auth.repository.UserRepository;
import com.auca.diacare.appointment.repository.AppointmentRepository;
import com.auca.diacare.doctor.dto.DoctorDTO;
import com.auca.diacare.doctor.dto.DoctorDashboardResponse;
import com.auca.diacare.doctor.model.Doctor;
import com.auca.diacare.doctor.service.DoctorService;
import com.auca.diacare.patient.model.Patient;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/doctors")
@Tag(name = "Doctors", description = "Doctor profile management")
@SecurityRequirement(name = "bearerAuth")
public class DoctorController {

    private final DoctorService doctorService;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;

    public DoctorController(DoctorService doctorService, UserRepository userRepository,
            AppointmentRepository appointmentRepository) {
        this.doctorService = doctorService;
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Operation(summary = "Register doctor profile")
    @PostMapping
    public ResponseEntity<Doctor> register(@Valid @RequestBody DoctorDTO dto) {
        User user = userRepository.findByPublicId(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Doctor doctor = new Doctor();
        doctor.setUser(user);
        doctor.setSpecialization(dto.getSpecialization());
        doctor.setLicenseNumber(dto.getLicenseNumber());
        doctor.setYearsOfExperience(dto.getYearsOfExperience());

        return ResponseEntity.ok(doctorService.registerDoctor(doctor));
    }

    @Operation(summary = "Get my doctor profile")
    @GetMapping("/me")
    public ResponseEntity<Doctor> getMyProfile(Authentication authentication) {
        return doctorService.getDoctorByEmail(authentication.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Get doctor by public ID")
    @GetMapping("/{publicId}")
    public ResponseEntity<Doctor> getByPublicId(@PathVariable UUID publicId) {
        return doctorService.getDoctorByPublicId(publicId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "List all doctors")
    @GetMapping("/all")
    public ResponseEntity<List<Doctor>> getAll() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @Operation(summary = "Search doctors by specialization")
    @GetMapping
    public ResponseEntity<List<Doctor>> getBySpecialization(@RequestParam String specialization) {
        return ResponseEntity.ok(doctorService.getDoctorsBySpecialization(specialization));
    }

    @Operation(summary = "Update doctor profile")
    @PutMapping("/{publicId}")
    public ResponseEntity<Doctor> update(@PathVariable UUID publicId, @Valid @RequestBody DoctorDTO dto) {
        Doctor details = new Doctor();
        details.setSpecialization(dto.getSpecialization());
        details.setLicenseNumber(dto.getLicenseNumber());
        details.setYearsOfExperience(dto.getYearsOfExperience());
        return ResponseEntity.ok(doctorService.updateDoctorProfile(publicId, details));
    }

    @Operation(summary = "Delete doctor profile")
    @DeleteMapping("/{publicId}")
    public ResponseEntity<Void> delete(@PathVariable UUID publicId) {
        doctorService.deleteDoctor(publicId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get doctor dashboard — alerts, appointments, patient count")
    @GetMapping("/dashboard")
    public ResponseEntity<DoctorDashboardResponse> getDashboard(Authentication authentication) {
        return ResponseEntity.ok(doctorService.getDashboard(authentication.getName()));
    }

    @Operation(summary = "Get my patients — derived from appointments")
    @GetMapping("/my-patients")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Patient>> getMyPatients(Authentication authentication) {
        List<Patient> patients = appointmentRepository
                .findByDoctor_User_Email(authentication.getName())
                .stream()
                .map(a -> a.getPatient())
                .distinct()
                .toList();
        return ResponseEntity.ok(patients);
    }
}
