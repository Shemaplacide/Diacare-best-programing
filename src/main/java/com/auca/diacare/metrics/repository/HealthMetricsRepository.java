package com.auca.diacare.metrics.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.auca.diacare.metrics.model.HealthMetrics;

@Repository
public interface HealthMetricsRepository extends JpaRepository<HealthMetrics, Long> {
    List<HealthMetrics> findByPatient_User_EmailOrderByRecordedAtDesc(String email);
    Optional<HealthMetrics> findFirstByPatient_User_EmailOrderByRecordedAtDesc(String email);
    List<HealthMetrics> findByPatient_IdOrderByRecordedAtDesc(Long patientId);
}
