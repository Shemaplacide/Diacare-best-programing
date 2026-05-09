package com.auca.diacare.metrics.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.auca.diacare.appointment.model.Appointment;
import com.auca.diacare.appointment.repository.AppointmentRepository;
import com.auca.diacare.glucose.dto.GlucoseTrendResponse;
import com.auca.diacare.glucose.service.GlucoseService;
import com.auca.diacare.metrics.dto.PatientDashboardResponse;
import com.auca.diacare.metrics.model.HealthMetrics;
import com.auca.diacare.metrics.repository.HealthMetricsRepository;
import com.auca.diacare.notification.repository.NotificationRepository;
import com.auca.diacare.patient.model.Patient;
import com.auca.diacare.patient.repository.PatientRepository;
import com.auca.diacare.prescription.repository.PrescriptionRepository;

@Service
public class HealthMetricsServiceImpl implements HealthMetricsService {

    private final HealthMetricsRepository metricsRepository;
    private final PatientRepository patientRepository;
    private final GlucoseService glucoseService;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final NotificationRepository notificationRepository;

    public HealthMetricsServiceImpl(HealthMetricsRepository metricsRepository,
            PatientRepository patientRepository,
            GlucoseService glucoseService,
            AppointmentRepository appointmentRepository,
            PrescriptionRepository prescriptionRepository,
            NotificationRepository notificationRepository) {
        this.metricsRepository = metricsRepository;
        this.patientRepository = patientRepository;
        this.glucoseService = glucoseService;
        this.appointmentRepository = appointmentRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.notificationRepository = notificationRepository;
    }

    @Override
    public HealthMetrics recordMetrics(HealthMetrics metrics) {
        return metricsRepository.save(metrics);
    }

    @Override
    public Optional<HealthMetrics> getLatest(String email) {
        return metricsRepository.findFirstByPatient_User_EmailOrderByRecordedAtDesc(email);
    }

    @Override
    public List<HealthMetrics> getHistory(String email) {
        return metricsRepository.findByPatient_User_EmailOrderByRecordedAtDesc(email);
    }

    @Override
    public PatientDashboardResponse getDashboard(String email) {
        Patient patient = patientRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        HealthMetrics latestMetrics = metricsRepository
                .findFirstByPatient_User_EmailOrderByRecordedAtDesc(email).orElse(null);

        GlucoseTrendResponse glucoseTrend = null;
        try {
            glucoseTrend = glucoseService.getTrend(email);
        } catch (Exception ignored) {}

        List<Appointment> allAppointments = appointmentRepository.findByPatient_User_Email(email);
        long upcoming = allAppointments.stream()
                .filter(a -> a.getAppointmentDate().isAfter(LocalDateTime.now())
                        && a.getStatus() != Appointment.Status.CANCELLED)
                .count();

        long activePrescriptions = prescriptionRepository.findByPatient_User_Email(email).stream()
                .filter(p -> p.getEndDate() == null || p.getEndDate().isAfter(java.time.LocalDate.now()))
                .count();

        long unread = notificationRepository.findByRecipient_EmailAndIsReadFalse(email).size();

        String overallStatus = computeOverallStatus(glucoseTrend, latestMetrics);
        String summary = buildSummary(overallStatus, glucoseTrend, latestMetrics, upcoming);

        PatientDashboardResponse dashboard = new PatientDashboardResponse();
        dashboard.setProfile(patient);
        dashboard.setLatestMetrics(latestMetrics);
        dashboard.setGlucoseTrend(glucoseTrend);
        dashboard.setTotalAppointments(allAppointments.size());
        dashboard.setUpcomingAppointments(upcoming);
        dashboard.setActivePrescriptions(activePrescriptions);
        dashboard.setUnreadNotifications(unread);
        dashboard.setOverallHealthStatus(overallStatus);
        dashboard.setHealthSummary(summary);

        return dashboard;
    }

    @Override
    @Transactional(readOnly = true)
    public List<HealthMetrics> getAll() {
        return metricsRepository.findAll();
    }

    @Override
    public void deleteMetrics(Long id) {
        metricsRepository.findById(id).orElseThrow(() -> new RuntimeException("Metrics record not found"));
        metricsRepository.deleteById(id);
    }

    private String computeOverallStatus(GlucoseTrendResponse trend, HealthMetrics metrics) {
        int riskScore = 0;

        if (trend != null) {
            if ("HIGH".equals(trend.getRiskLevel())) riskScore += 3;
            else if ("MODERATE".equals(trend.getRiskLevel())) riskScore += 1;
        }

        if (metrics != null) {
            // HbA1c: >9% is poor control, 7-9% is moderate
            if (metrics.getHba1c() != null) {
                if (metrics.getHba1c() > 9.0) riskScore += 3;
                else if (metrics.getHba1c() > 7.0) riskScore += 1;
            }
            // Hypertension: systolic >140 or diastolic >90
            if (metrics.getBloodPressureSystolic() != null && metrics.getBloodPressureSystolic() > 140) riskScore += 2;
            if (metrics.getBloodPressureDiastolic() != null && metrics.getBloodPressureDiastolic() > 90) riskScore += 1;
            // BMI: >30 is obese
            if (metrics.getBmi() != null && metrics.getBmi() > 30) riskScore += 1;
        }

        if (riskScore >= 5) return "CRITICAL";
        if (riskScore >= 3) return "AT_RISK";
        if (riskScore >= 1) return "NEEDS_ATTENTION";
        return "GOOD";
    }

    private String buildSummary(String status, GlucoseTrendResponse trend, HealthMetrics metrics, long upcoming) {
        StringBuilder sb = new StringBuilder();
        switch (status) {
            case "CRITICAL" -> sb.append("Your health indicators require immediate medical attention. ");
            case "AT_RISK" -> sb.append("Several health indicators are outside target range. ");
            case "NEEDS_ATTENTION" -> sb.append("Some health indicators need monitoring. ");
            default -> sb.append("Your health indicators are within target range. ");
        }
        if (trend != null && trend.getAverageLast7Days() != null)
            sb.append(String.format("7-day avg glucose: %.1f mmol/L. ", trend.getAverageLast7Days()));
        if (metrics != null && metrics.getHba1c() != null)
            sb.append(String.format("Latest HbA1c: %.1f%%. ", metrics.getHba1c()));
        if (upcoming > 0)
            sb.append(String.format("You have %d upcoming appointment(s).", upcoming));
        return sb.toString().trim();
    }
}
