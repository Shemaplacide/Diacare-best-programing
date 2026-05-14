package com.auca.diacare.metrics.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.auca.diacare.appointment.repository.AppointmentRepository;
import com.auca.diacare.glucose.service.GlucoseService;
import com.auca.diacare.metrics.model.HealthMetrics;
import com.auca.diacare.metrics.repository.HealthMetricsRepository;
import com.auca.diacare.notification.repository.NotificationRepository;
import com.auca.diacare.patient.repository.PatientRepository;
import com.auca.diacare.prescription.repository.PrescriptionRepository;

@ExtendWith(MockitoExtension.class)
class HealthMetricsServiceImplTest {

    @Mock private HealthMetricsRepository metricsRepository;
    @Mock private PatientRepository patientRepository;
    @Mock private GlucoseService glucoseService;
    @Mock private AppointmentRepository appointmentRepository;
    @Mock private PrescriptionRepository prescriptionRepository;
    @Mock private NotificationRepository notificationRepository;

    @InjectMocks
    private HealthMetricsServiceImpl metricsService;

    @Test
    void updateMetricsChangesEditableLabFields() {
        HealthMetrics existing = new HealthMetrics();
        existing.setWeight(70.0);
        existing.setHeight(170.0);
        existing.setHba1c(8.2);
        existing.setCholesterol(5.0);

        HealthMetrics updates = new HealthMetrics();
        updates.setWeight(72.0);
        updates.setHeight(171.0);
        updates.setHba1c(7.1);
        updates.setCholesterol(4.4);
        updates.setRecordedAt(LocalDateTime.of(2030, 2, 4, 9, 30));

        when(metricsRepository.findById(2L)).thenReturn(Optional.of(existing));
        when(metricsRepository.save(any(HealthMetrics.class))).thenAnswer(invocation -> invocation.getArgument(0));

        metricsService.updateMetrics(2L, updates);

        ArgumentCaptor<HealthMetrics> captor = ArgumentCaptor.forClass(HealthMetrics.class);
        verify(metricsRepository).save(captor.capture());
        HealthMetrics saved = captor.getValue();

        assertEquals(72.0, saved.getWeight());
        assertEquals(171.0, saved.getHeight());
        assertEquals(7.1, saved.getHba1c());
        assertEquals(4.4, saved.getCholesterol());
        assertEquals(LocalDateTime.of(2030, 2, 4, 9, 30), saved.getRecordedAt());
    }
}
