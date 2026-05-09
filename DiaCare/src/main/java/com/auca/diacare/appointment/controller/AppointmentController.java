package com.auca.diacare.appointment.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.auca.diacare.appointment.dto.AppointmentDTO;
import com.auca.diacare.appointment.model.Appointment;
import com.auca.diacare.appointment.model.Appointment.Status;
import com.auca.diacare.appointment.service.AppointmentService;
import com.auca.diacare.auth.repository.UserRepository;
import com.auca.diacare.doctor.model.Doctor;
import com.auca.diacare.doctor.repository.DoctorRepository;
import com.auca.diacare.patient.model.Patient;
import com.auca.diacare.patient.repository.PatientRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/appointments")
@Tag(name = "Appointments", description = "Appointment scheduling between patients and doctors")
@SecurityRequirement(name = "bearerAuth")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    public AppointmentController(AppointmentService appointmentService,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            UserRepository userRepository) {
        this.appointmentService = appointmentService;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
    }

    @Operation(summary = "Book an appointment (weekdays only, 9AM–6PM)")
    @PostMapping
    public ResponseEntity<Appointment> create(@Valid @RequestBody AppointmentDTO dto,
            Authentication authentication) {
        // Resolve patient from the authenticated user
        Patient patient = patientRepository.findByUserEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));

        // Resolve doctor from provided publicId (required)
        if (dto.getDoctorPublicId() == null) {
            throw new RuntimeException("Please select a doctor");
        }
        Doctor doctor = doctorRepository.findByUser_PublicId(dto.getDoctorPublicId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(dto.getAppointmentDate());
        appointment.setNotes(dto.getNotes());

        return ResponseEntity.ok(appointmentService.createAppointment(appointment));
    }

    @Operation(summary = "Get appointment by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getById(@PathVariable Long id) {
        return appointmentService.getAppointmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Get my appointments")
    @GetMapping("/my")
    public ResponseEntity<List<Appointment>> getMyAppointments(Authentication authentication) {
        String email = authentication.getName();
        List<Appointment> asPatient = appointmentService.getAppointmentsByPatientEmail(email);
        if (!asPatient.isEmpty())
            return ResponseEntity.ok(asPatient);
        return ResponseEntity.ok(appointmentService.getAppointmentsByDoctorEmail(email));
    }

    @Operation(summary = "Get all appointments (doctor/admin)")
    @GetMapping("/all")
    public ResponseEntity<List<Appointment>> getAll() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @Operation(summary = "Update appointment status", description = "Values: PENDING, CONFIRMED, CANCELLED, COMPLETED")
    @PutMapping("/{id}/status")
    public ResponseEntity<Appointment> updateStatus(@PathVariable Long id, @RequestBody Status status) {
        return ResponseEntity.ok(appointmentService.updateStatus(id, status));
    }

    @Operation(summary = "Reschedule an appointment (weekdays only, 9AM–6PM)")
    @PutMapping("/{id}/reschedule")
    public ResponseEntity<Appointment> reschedule(@PathVariable Long id, @RequestBody LocalDateTime newDate) {
        return ResponseEntity.ok(appointmentService.reschedule(id, newDate));
    }

    @Operation(summary = "Cancel appointment")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        appointmentService.cancelAppointment(id);
        return ResponseEntity.noContent().build();
    }
}
