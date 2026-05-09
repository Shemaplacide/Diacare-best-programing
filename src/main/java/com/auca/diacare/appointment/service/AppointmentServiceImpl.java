package com.auca.diacare.appointment.service;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.auca.diacare.appointment.model.Appointment;
import com.auca.diacare.appointment.model.Appointment.Status;
import com.auca.diacare.appointment.repository.AppointmentRepository;

@Service
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;

    public AppointmentServiceImpl(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    @Override
    public Appointment createAppointment(Appointment appointment) {
        validateAppointmentDate(appointment.getAppointmentDate());
        return appointmentRepository.save(appointment);
    }

    @Override
    public Optional<Appointment> getAppointmentById(Long id) {
        return appointmentRepository.findById(id);
    }

    @Override
    public List<Appointment> getAppointmentsByPatientEmail(String email) {
        return appointmentRepository.findByPatient_User_Email(email);
    }

    @Override
    public List<Appointment> getAppointmentsByDoctorEmail(String email) {
        return appointmentRepository.findByDoctor_User_Email(email);
    }

    @Override
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    @Override
    public Appointment updateStatus(Long id, Status status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }

    @Override
    public Appointment reschedule(Long id, LocalDateTime newDate) {
        validateAppointmentDate(newDate);
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        if (appointment.getStatus() == Status.CANCELLED) {
            throw new RuntimeException("Cannot reschedule a cancelled appointment");
        }
        appointment.setAppointmentDate(newDate);
        appointment.setStatus(Status.PENDING);
        return appointmentRepository.save(appointment);
    }

    @Override
    public void cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setStatus(Status.CANCELLED);
        appointmentRepository.save(appointment);
    }

    private void validateAppointmentDate(LocalDateTime date) {
        if (date.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Appointment date cannot be in the past");
        }
        DayOfWeek day = date.getDayOfWeek();
        if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) {
            throw new RuntimeException("Appointments are only available on weekdays (Monday to Friday)");
        }
        int hour = date.getHour();
        if (hour < 9 || hour >= 18) {
            throw new RuntimeException("Appointments must be between 9:00 AM and 6:00 PM");
        }
    }
}
