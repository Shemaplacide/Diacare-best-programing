package com.auca.diacare.metrics.dto;

import com.auca.diacare.glucose.dto.GlucoseTrendResponse;
import com.auca.diacare.metrics.model.HealthMetrics;
import com.auca.diacare.patient.model.Patient;

public class PatientDashboardResponse {

    private Patient profile;
    private HealthMetrics latestMetrics;
    private GlucoseTrendResponse glucoseTrend;
    private long totalAppointments;
    private long upcomingAppointments;
    private long activePrescriptions;
    private long unreadNotifications;

    // Overall health status derived from glucose risk + HbA1c + BP
    private String overallHealthStatus;
    private String healthSummary;

    public Patient getProfile() { return profile; }
    public void setProfile(Patient profile) { this.profile = profile; }

    public HealthMetrics getLatestMetrics() { return latestMetrics; }
    public void setLatestMetrics(HealthMetrics latestMetrics) { this.latestMetrics = latestMetrics; }

    public GlucoseTrendResponse getGlucoseTrend() { return glucoseTrend; }
    public void setGlucoseTrend(GlucoseTrendResponse glucoseTrend) { this.glucoseTrend = glucoseTrend; }

    public long getTotalAppointments() { return totalAppointments; }
    public void setTotalAppointments(long totalAppointments) { this.totalAppointments = totalAppointments; }

    public long getUpcomingAppointments() { return upcomingAppointments; }
    public void setUpcomingAppointments(long upcomingAppointments) { this.upcomingAppointments = upcomingAppointments; }

    public long getActivePrescriptions() { return activePrescriptions; }
    public void setActivePrescriptions(long activePrescriptions) { this.activePrescriptions = activePrescriptions; }

    public long getUnreadNotifications() { return unreadNotifications; }
    public void setUnreadNotifications(long unreadNotifications) { this.unreadNotifications = unreadNotifications; }

    public String getOverallHealthStatus() { return overallHealthStatus; }
    public void setOverallHealthStatus(String overallHealthStatus) { this.overallHealthStatus = overallHealthStatus; }

    public String getHealthSummary() { return healthSummary; }
    public void setHealthSummary(String healthSummary) { this.healthSummary = healthSummary; }
}
