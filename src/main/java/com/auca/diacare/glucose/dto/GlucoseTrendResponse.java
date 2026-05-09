package com.auca.diacare.glucose.dto;

import java.util.List;

import com.auca.diacare.glucose.model.GlucoseReading;

public class GlucoseTrendResponse {

    private Double averageLast7Days;
    private Double averageLast30Days;
    private Long highReadingsLast7Days;   // readings above threshold
    private Double lowestReading;
    private Double highestReading;
    private String riskLevel;             // LOW, MODERATE, HIGH
    private List<GlucoseReading> recentReadings;

    public Double getAverageLast7Days() { return averageLast7Days; }
    public void setAverageLast7Days(Double averageLast7Days) { this.averageLast7Days = averageLast7Days; }

    public Double getAverageLast30Days() { return averageLast30Days; }
    public void setAverageLast30Days(Double averageLast30Days) { this.averageLast30Days = averageLast30Days; }

    public Long getHighReadingsLast7Days() { return highReadingsLast7Days; }
    public void setHighReadingsLast7Days(Long highReadingsLast7Days) { this.highReadingsLast7Days = highReadingsLast7Days; }

    public Double getLowestReading() { return lowestReading; }
    public void setLowestReading(Double lowestReading) { this.lowestReading = lowestReading; }

    public Double getHighestReading() { return highestReading; }
    public void setHighestReading(Double highestReading) { this.highestReading = highestReading; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public List<GlucoseReading> getRecentReadings() { return recentReadings; }
    public void setRecentReadings(List<GlucoseReading> recentReadings) { this.recentReadings = recentReadings; }
}
