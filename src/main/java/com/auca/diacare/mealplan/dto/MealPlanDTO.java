package com.auca.diacare.mealplan.dto;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public class MealPlanDTO {

    @NotNull(message = "Patient public ID is required")
    private UUID patientPublicId;

    @NotNull(message = "Doctor public ID is required")
    private UUID doctorPublicId;

    private String diabetesType;
    private String calorieGoal;
    private String breakfast;
    private String lunch;
    private String dinner;
    private String snacks;
    private String notes;
    private LocalDate startDate;
    private LocalDate endDate;

    public UUID getPatientPublicId() { return patientPublicId; }
    public void setPatientPublicId(UUID patientPublicId) { this.patientPublicId = patientPublicId; }
    public UUID getDoctorPublicId() { return doctorPublicId; }
    public void setDoctorPublicId(UUID doctorPublicId) { this.doctorPublicId = doctorPublicId; }
    public String getDiabetesType() { return diabetesType; }
    public void setDiabetesType(String diabetesType) { this.diabetesType = diabetesType; }
    public String getCalorieGoal() { return calorieGoal; }
    public void setCalorieGoal(String calorieGoal) { this.calorieGoal = calorieGoal; }
    public String getBreakfast() { return breakfast; }
    public void setBreakfast(String breakfast) { this.breakfast = breakfast; }
    public String getLunch() { return lunch; }
    public void setLunch(String lunch) { this.lunch = lunch; }
    public String getDinner() { return dinner; }
    public void setDinner(String dinner) { this.dinner = dinner; }
    public String getSnacks() { return snacks; }
    public void setSnacks(String snacks) { this.snacks = snacks; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
}
