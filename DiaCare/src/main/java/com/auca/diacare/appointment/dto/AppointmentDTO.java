package com.auca.diacare.appointment.dto;

import java.time.LocalDateTime;

import com.auca.diacare.appointment.model.Appointment.Status;

import jakarta.validation.constraints.NotNull;

public class AppointmentDTO {

    private java.util.UUID patientPublicId;

    private java.util.UUID doctorPublicId;

    @NotNull(message = "Appointment date is required")
    private LocalDateTime appointmentDate;

    private Status status;
    private String notes;

    public java.util.UUID getPatientPublicId() { return patientPublicId; }
    public void setPatientPublicId(java.util.UUID patientPublicId) { this.patientPublicId = patientPublicId; }

    public java.util.UUID getDoctorPublicId() { return doctorPublicId; }
    public void setDoctorPublicId(java.util.UUID doctorPublicId) { this.doctorPublicId = doctorPublicId; }

    public LocalDateTime getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDateTime appointmentDate) { this.appointmentDate = appointmentDate; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
