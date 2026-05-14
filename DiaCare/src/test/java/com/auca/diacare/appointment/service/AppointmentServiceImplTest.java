package com.auca.diacare.appointment.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.auca.diacare.appointment.model.Appointment;
import com.auca.diacare.appointment.repository.AppointmentRepository;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceImplTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @InjectMocks
    private AppointmentServiceImpl appointmentService;

    @Test
    void createAppointmentRejectsPastDate() {
        Appointment appointment = new Appointment();
        appointment.setAppointmentDate(LocalDateTime.now().minusDays(1));

        assertThrows(RuntimeException.class, () -> appointmentService.createAppointment(appointment));
    }

    @Test
    void createAppointmentRejectsWeekendDate() {
        Appointment appointment = new Appointment();
        appointment.setAppointmentDate(LocalDateTime.of(2030, 1, 5, 10, 0));

        assertThrows(RuntimeException.class, () -> appointmentService.createAppointment(appointment));
    }

    @Test
    void createAppointmentSavesValidWeekdayBusinessHourDate() {
        Appointment appointment = new Appointment();
        appointment.setAppointmentDate(LocalDateTime.of(2030, 1, 7, 10, 30));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        appointmentService.createAppointment(appointment);

        verify(appointmentRepository).save(appointment);
    }
}
