package com.auca.diacare.glucose.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.auca.diacare.glucose.dto.GlucoseTrendResponse;
import com.auca.diacare.glucose.model.GlucoseReading;

public interface GlucoseService {
    GlucoseReading logReading(GlucoseReading reading);

    Optional<GlucoseReading> getById(Long id);

    List<GlucoseReading> getMyReadings(String email);

    List<GlucoseReading> getReadingsInRange(Long patientId, LocalDateTime from, LocalDateTime to);

    GlucoseTrendResponse getTrend(String email);

    List<GlucoseReading> getAllReadings();

    void deleteReading(Long id);
}
