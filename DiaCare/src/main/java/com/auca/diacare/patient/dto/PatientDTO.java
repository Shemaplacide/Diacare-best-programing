package com.auca.diacare.patient.dto;

import java.time.LocalDate;
import java.util.UUID;

// @Data
public class PatientDTO {
    private String diabetesType;

    private LocalDate dateOfBirth;

    private String gender;

    private Double targetHbA1c;

    private UUID userId;

    // Getters and Setters
    public String getDiabetesType() {
        return diabetesType;
    }

    public void setDiabetesType(String diabetesType) {
        this.diabetesType = diabetesType;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public Double getTargetHbA1c() {
        return targetHbA1c;
    }

    public void setTargetHbA1c(Double targetHbA1c) {
        this.targetHbA1c = targetHbA1c;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }
}
