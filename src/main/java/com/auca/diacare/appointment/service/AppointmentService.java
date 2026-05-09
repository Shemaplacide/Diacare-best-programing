package com.auca.diacare.appointment.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.auca.diacare.appointment.model.Appointment;
import com.auca.diacare.appointment.model.Appointment.Status;

public interface AppointmentService {
    Appointment createAppointment(Appointment appointment);

    Optional<Appointment> getAppointmentById(Long id);

    List<Appointment> getAppointmentsByPatientEmail(String email);

    List<Appointment> getAppointmentsByDoctorEmail(String email);

    List<Appointment> getAllAppointments();

    Appointment updateStatus(Long id, Status status);

    Appointment reschedule(Long id, LocalDateTime newDate);

    void cancelAppointment(Long id);
}
