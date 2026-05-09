package com.auca.diacare.prescription.controller;

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

import com.auca.diacare.appointment.model.Appointment;
import com.auca.diacare.appointment.repository.AppointmentRepository;
import com.auca.diacare.doctor.model.Doctor;
import com.auca.diacare.doctor.repository.DoctorRepository;
import com.auca.diacare.patient.model.Patient;
import com.auca.diacare.patient.repository.PatientRepository;
import com.auca.diacare.prescription.dto.PrescriptionDTO;
import com.auca.diacare.prescription.model.Prescription;
import com.auca.diacare.prescription.service.PrescriptionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/prescriptions")
@Tag(name = "Prescriptions", description = "Medication prescriptions issued by doctors")
@SecurityRequirement(name = "bearerAuth")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    public PrescriptionController(PrescriptionService prescriptionService,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository) {
        this.prescriptionService = prescriptionService;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Operation(summary = "Issue a prescription")
    @PostMapping
    public ResponseEntity<Prescription> create(@Valid @RequestBody PrescriptionDTO dto) {
        Patient patient = patientRepository.findByUser_PublicId(dto.getPatientPublicId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        Doctor doctor = doctorRepository.findByUser_PublicId(dto.getDoctorPublicId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Prescription prescription = new Prescription();
        prescription.setPatient(patient);
        prescription.setDoctor(doctor);
        prescription.setMedication(dto.getMedication());
        prescription.setDosage(dto.getDosage());
        prescription.setInstructions(dto.getInstructions());
        prescription.setStartDate(dto.getStartDate());
        prescription.setEndDate(dto.getEndDate());

        if (dto.getAppointmentId() != null) {
            Appointment appointment = appointmentRepository.findById(dto.getAppointmentId())
                    .orElseThrow(() -> new RuntimeException("Appointment not found"));
            prescription.setAppointment(appointment);
        }

        return ResponseEntity.ok(prescriptionService.createPrescription(prescription));
    }

    @Operation(summary = "Get prescription by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Prescription> getById(@PathVariable Long id) {
        return prescriptionService.getPrescriptionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Get my prescriptions", description = "Returns prescriptions for the authenticated patient or doctor")
    @GetMapping("/my")
    public ResponseEntity<List<Prescription>> getMyPrescriptions(Authentication authentication) {
        String email = authentication.getName();
        List<Prescription> asPatient = prescriptionService.getPrescriptionsByPatientEmail(email);
        if (!asPatient.isEmpty())
            return ResponseEntity.ok(asPatient);
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByDoctorEmail(email));
    }

    @Operation(summary = "Get all prescriptions (doctor/admin)")
    @GetMapping("/all")
    public ResponseEntity<List<Prescription>> getAll() {
        return ResponseEntity.ok(prescriptionService.getAllPrescriptions());
    }

    @Operation(summary = "Get prescriptions by appointment")
    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<List<Prescription>> getByAppointment(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByAppointment(appointmentId));
    }

    @Operation(summary = "Update prescription")
    @PutMapping("/{id}")
    public ResponseEntity<Prescription> update(@PathVariable Long id, @Valid @RequestBody PrescriptionDTO dto) {
        Prescription details = new Prescription();
        details.setMedication(dto.getMedication());
        details.setDosage(dto.getDosage());
        details.setInstructions(dto.getInstructions());
        details.setStartDate(dto.getStartDate());
        details.setEndDate(dto.getEndDate());
        return ResponseEntity.ok(prescriptionService.updatePrescription(id, details));
    }

    @Operation(summary = "Delete prescription")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        prescriptionService.deletePrescription(id);
        return ResponseEntity.noContent().build();
    }
}
