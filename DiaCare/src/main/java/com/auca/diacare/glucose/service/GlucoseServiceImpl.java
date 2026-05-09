package com.auca.diacare.glucose.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.auca.diacare.glucose.dto.GlucoseTrendResponse;
import com.auca.diacare.glucose.model.GlucoseReading;
import com.auca.diacare.glucose.repository.GlucoseReadingRepository;
import com.auca.diacare.patient.model.Patient;
import com.auca.diacare.patient.repository.PatientRepository;

@Service
public class GlucoseServiceImpl implements GlucoseService {

    // Normal fasting threshold in mmol/L (7.0 = hyperglycemia boundary)
    private static final double HIGH_THRESHOLD_MMOL = 7.0;

    private final GlucoseReadingRepository glucoseRepository;
    private final PatientRepository patientRepository;

    public GlucoseServiceImpl(GlucoseReadingRepository glucoseRepository, PatientRepository patientRepository) {
        this.glucoseRepository = glucoseRepository;
        this.patientRepository = patientRepository;
    }

    @Override
    public GlucoseReading logReading(GlucoseReading reading) {
        return glucoseRepository.save(reading);
    }

    @Override
    public Optional<GlucoseReading> getById(Long id) {
        return glucoseRepository.findById(id);
    }

    @Override
    public List<GlucoseReading> getMyReadings(String email) {
        return glucoseRepository.findByPatient_User_EmailOrderByRecordedAtDesc(email);
    }

    @Override
    public List<GlucoseReading> getReadingsInRange(Long patientId, LocalDateTime from, LocalDateTime to) {
        return glucoseRepository.findByPatient_IdAndRecordedAtBetweenOrderByRecordedAtAsc(patientId, from, to);
    }

    @Override
    public GlucoseTrendResponse getTrend(String email) {
        Patient patient = patientRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysAgo = now.minusDays(7);
        LocalDateTime thirtyDaysAgo = now.minusDays(30);

        Double avg7 = glucoseRepository.findAverageGlucoseSince(patient.getId(), sevenDaysAgo);
        Double avg30 = glucoseRepository.findAverageGlucoseSince(patient.getId(), thirtyDaysAgo);
        Long highCount7 = glucoseRepository.countHighReadingsSince(patient.getId(), HIGH_THRESHOLD_MMOL, sevenDaysAgo);

        List<GlucoseReading> recent = glucoseRepository
                .findByPatient_IdOrderByRecordedAtDesc(patient.getId())
                .stream().limit(10).toList();

        List<GlucoseReading> all30 = glucoseRepository
                .findByPatient_IdAndRecordedAtBetweenOrderByRecordedAtAsc(patient.getId(), thirtyDaysAgo, now);

        Double lowest = all30.stream().map(GlucoseReading::getValue).min(Comparator.naturalOrder()).orElse(null);
        Double highest = all30.stream().map(GlucoseReading::getValue).max(Comparator.naturalOrder()).orElse(null);

        GlucoseTrendResponse response = new GlucoseTrendResponse();
        response.setAverageLast7Days(avg7 != null ? Math.round(avg7 * 100.0) / 100.0 : null);
        response.setAverageLast30Days(avg30 != null ? Math.round(avg30 * 100.0) / 100.0 : null);
        response.setHighReadingsLast7Days(highCount7 != null ? highCount7 : 0L);
        response.setLowestReading(lowest);
        response.setHighestReading(highest);
        response.setRiskLevel(calculateRisk(avg7, highCount7));
        response.setRecentReadings(recent);

        return response;
    }

    @Override
    public List<GlucoseReading> getAllReadings() {
        return glucoseRepository.findAll();
    }

    @Override
    public void deleteReading(Long id) {
        glucoseRepository.findById(id).orElseThrow(() -> new RuntimeException("Reading not found"));
        glucoseRepository.deleteById(id);
    }

    private String calculateRisk(Double avg7, Long highCount7) {
        if (avg7 == null)
            return "UNKNOWN";
        if (avg7 > 10.0 || (highCount7 != null && highCount7 >= 5))
            return "HIGH";
        if (avg7 > 7.0 || (highCount7 != null && highCount7 >= 2))
            return "MODERATE";
        return "LOW";
    }
}
