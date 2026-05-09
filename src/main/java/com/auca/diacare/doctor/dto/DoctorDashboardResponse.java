package com.auca.diacare.doctor.dto;

import java.util.List;

import com.auca.diacare.appointment.model.Appointment;
import com.auca.diacare.glucose.model.GlucoseReading;
import com.auca.diacare.patient.model.Patient;

public class DoctorDashboardResponse {

    private int totalPatients;
    private int todayAppointments;
    private int pendingAppointments;
    private List<Appointment> upcomingAppointments;
    private List<CriticalAlert> criticalAlerts;

    public static class CriticalAlert {
        private String patientName;
        private String patientEmail;
        private Double glucoseValue;
        private String unit;
        private String level;
        private String recordedAt;

        public CriticalAlert(String patientName, String patientEmail,
                             Double glucoseValue, String unit, String level, String recordedAt) {
            this.patientName = patientName;
            this.patientEmail = patientEmail;
            this.glucoseValue = glucoseValue;
            this.unit = unit;
            this.level = level;
            this.recordedAt = recordedAt;
        }

        public String getPatientName() { return patientName; }
        public String getPatientEmail() { return patientEmail; }
        public Double getGlucoseValue() { return glucoseValue; }
        public String getUnit() { return unit; }
        public String getLevel() { return level; }
        public String getRecordedAt() { return recordedAt; }
    }

    public int getTotalPatients() { return totalPatients; }
    public void setTotalPatients(int totalPatients) { this.totalPatients = totalPatients; }

    public int getTodayAppointments() { return todayAppointments; }
    public void setTodayAppointments(int todayAppointments) { this.todayAppointments = todayAppointments; }

    public int getPendingAppointments() { return pendingAppointments; }
    public void setPendingAppointments(int pendingAppointments) { this.pendingAppointments = pendingAppointments; }

    public List<Appointment> getUpcomingAppointments() { return upcomingAppointments; }
    public void setUpcomingAppointments(List<Appointment> upcomingAppointments) { this.upcomingAppointments = upcomingAppointments; }

    public List<CriticalAlert> getCriticalAlerts() { return criticalAlerts; }
    public void setCriticalAlerts(List<CriticalAlert> criticalAlerts) { this.criticalAlerts = criticalAlerts; }
}
