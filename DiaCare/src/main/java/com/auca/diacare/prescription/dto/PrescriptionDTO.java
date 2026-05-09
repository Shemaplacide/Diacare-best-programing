package com.auca.diacare.prescription.dto;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class PrescriptionDTO {

    @NotNull(message = "Patient public ID is required")
    private UUID patientPublicId;

    @NotNull(message = "Doctor public ID is required")
    private UUID doctorPublicId;

    private Long appointmentId;

    @NotBlank(message = "Medication is required")
    private String medication;

    @NotBlank(message = "Dosage is required")
    private String dosage;

    private String instructions;
    private LocalDate startDate;
    private LocalDate endDate;

    public UUID getPatientPublicId() { return patientPublicId; }
    public void setPatientPublicId(UUID patientPublicId) { this.patientPublicId = patientPublicId; }

    public UUID getDoctorPublicId() { return doctorPublicId; }
    public void setDoctorPublicId(UUID doctorPublicId) { this.doctorPublicId = doctorPublicId; }

    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }

    public String getMedication() { return medication; }
    public void setMedication(String medication) { this.medication = medication; }

    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
}
