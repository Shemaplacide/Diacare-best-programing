package com.auca.diacare.glucose.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.auca.diacare.glucose.model.GlucoseReading;

@Repository
public interface GlucoseReadingRepository extends JpaRepository<GlucoseReading, Long> {

    List<GlucoseReading> findByPatient_IdOrderByRecordedAtDesc(Long patientId);

    List<GlucoseReading> findByPatient_User_EmailOrderByRecordedAtDesc(String email);

    List<GlucoseReading> findByPatient_IdAndRecordedAtBetweenOrderByRecordedAtAsc(
            Long patientId, LocalDateTime from, LocalDateTime to);

    @Query("SELECT AVG(g.value) FROM GlucoseReading g WHERE g.patient.id = :patientId AND g.recordedAt >= :from")
    Double findAverageGlucoseSince(@Param("patientId") Long patientId, @Param("from") LocalDateTime from);

    @Query("SELECT COUNT(g) FROM GlucoseReading g WHERE g.patient.id = :patientId AND g.value > :threshold AND g.recordedAt >= :from")
    Long countHighReadingsSince(@Param("patientId") Long patientId, @Param("threshold") Double threshold, @Param("from") LocalDateTime from);
}
