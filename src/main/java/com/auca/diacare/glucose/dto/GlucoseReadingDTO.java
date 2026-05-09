package com.auca.diacare.glucose.dto;

import java.time.LocalDateTime;

import com.auca.diacare.glucose.model.GlucoseReading.MealContext;
import com.auca.diacare.glucose.model.GlucoseReading.Unit;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class GlucoseReadingDTO {

    @NotNull @Positive
    private Double value;

    private Unit unit = Unit.MMOL_L;

    @NotNull
    private MealContext mealContext;

    private LocalDateTime recordedAt;
    private String notes;

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
}
