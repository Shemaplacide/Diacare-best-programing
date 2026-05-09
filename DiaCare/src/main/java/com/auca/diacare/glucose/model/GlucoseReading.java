package com.auca.diacare.glucose.model;

import java.time.LocalDateTime;

import com.auca.diacare.patient.model.Patient;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "glucose_readings")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class GlucoseReading {

    public enum MealContext { FASTING, BEFORE_MEAL, AFTER_MEAL, BEDTIME, RANDOM }
    public enum Unit { MMOL_L, MG_DL }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false)
    private Double value;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Unit unit = Unit.MMOL_L;

    @Enumerated(EnumType.STRING)
    @Column(name = "meal_context", nullable = false)
    private MealContext mealContext;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (recordedAt == null) recordedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public Double getValue() { return value; }
    public void setValue(Double value) { this.value = value; }

    public Unit getUnit() { return unit; }
    public void setUnit(Unit unit) { this.unit = unit; }

    public MealContext getMealContext() { return mealContext; }
    public void setMealContext(MealContext mealContext) { this.mealContext = mealContext; }

    public LocalDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(LocalDateTime recordedAt) { this.recordedAt = recordedAt; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
