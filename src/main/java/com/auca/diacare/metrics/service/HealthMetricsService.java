package com.auca.diacare.metrics.service;

import java.util.List;
import java.util.Optional;

import com.auca.diacare.metrics.dto.PatientDashboardResponse;
import com.auca.diacare.metrics.model.HealthMetrics;

public interface HealthMetricsService {
    HealthMetrics recordMetrics(HealthMetrics metrics);
    Optional<HealthMetrics> getLatest(String email);
    List<HealthMetrics> getHistory(String email);
    List<HealthMetrics> getAll();
    PatientDashboardResponse getDashboard(String email);
    void deleteMetrics(Long id);
}
