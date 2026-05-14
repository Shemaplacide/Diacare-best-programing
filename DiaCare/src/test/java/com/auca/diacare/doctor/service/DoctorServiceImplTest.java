package com.auca.diacare.doctor.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.auca.diacare.appointment.repository.AppointmentRepository;
import com.auca.diacare.auth.model.Role;
import com.auca.diacare.auth.model.User;
import com.auca.diacare.doctor.dto.DoctorDashboardResponse;
import com.auca.diacare.doctor.model.Doctor;
import com.auca.diacare.doctor.repository.DoctorRepository;
import com.auca.diacare.glucose.model.GlucoseReading;
import com.auca.diacare.glucose.model.GlucoseReading.MealContext;
import com.auca.diacare.glucose.model.GlucoseReading.Unit;
import com.auca.diacare.glucose.repository.GlucoseReadingRepository;
import com.auca.diacare.patient.model.Patient;
import com.auca.diacare.patient.repository.PatientRepository;

@ExtendWith(MockitoExtension.class)
class DoctorServiceImplTest {

    @Mock private DoctorRepository doctorRepository;
    @Mock private AppointmentRepository appointmentRepository;
    @Mock private PatientRepository patientRepository;
    @Mock private GlucoseReadingRepository glucoseRepository;

    @InjectMocks
    private DoctorServiceImpl doctorService;

    @Test
    void dashboardCountsOneCriticalPatientEvenWithMultipleCriticalReadings() {
        Doctor doctor = new Doctor();
        doctor.setId(10L);
        doctor.setUser(user(10L, "Dr Grace", "doctor@example.com", Role.DOCTOR));

        Patient patient = new Patient();
        patient.setId(20L);
        patient.setUser(user(20L, "Alice", "alice@example.com", Role.PATIENT));

        GlucoseReading high = reading(patient, 14.8, LocalDateTime.now().minusHours(2));
        GlucoseReading low = reading(patient, 2.7, LocalDateTime.now().minusHours(1));

        when(doctorRepository.findByUserEmail("doctor@example.com")).thenReturn(Optional.of(doctor));
        when(appointmentRepository.findByDoctor_User_Email("doctor@example.com")).thenReturn(List.of());
        when(patientRepository.findByPreferredDoctor_Id(10L)).thenReturn(List.of(patient));
        when(glucoseRepository.findByPatient_IdAndRecordedAtBetweenOrderByRecordedAtAsc(any(), any(), any()))
                .thenReturn(List.of(high, low));

        DoctorDashboardResponse dashboard = doctorService.getDashboard("doctor@example.com");

        assertEquals(1, dashboard.getTotalPatients());
        assertEquals(2, dashboard.getCriticalAlerts().size());
        assertEquals(1, dashboard.getCriticalPatientCount());
    }

    private static User user(Long id, String name, String email, Role role) {
        User user = new User();
        user.setId(id);
        user.setUsername(name);
        user.setEmail(email);
        user.setPassword("password");
        user.setRole(role);
        return user;
    }

    private static GlucoseReading reading(Patient patient, double value, LocalDateTime recordedAt) {
        GlucoseReading reading = new GlucoseReading();
        reading.setPatient(patient);
        reading.setValue(value);
        reading.setUnit(Unit.MMOL_L);
        reading.setMealContext(MealContext.RANDOM);
        reading.setRecordedAt(recordedAt);
        return reading;
    }
}
