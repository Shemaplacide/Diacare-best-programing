package com.auca.diacare.mealplan.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.auca.diacare.doctor.model.Doctor;
import com.auca.diacare.doctor.repository.DoctorRepository;
import com.auca.diacare.mealplan.dto.MealPlanDTO;
import com.auca.diacare.mealplan.model.MealPlan;
import com.auca.diacare.mealplan.service.MealPlanService;
import com.auca.diacare.patient.model.Patient;
import com.auca.diacare.patient.repository.PatientRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/meal-plans")
@Tag(name = "Meal Plans", description = "Diet and nutrition planning for patients")
@SecurityRequirement(name = "bearerAuth")
public class MealPlanController {

    private final MealPlanService mealPlanService;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public MealPlanController(MealPlanService mealPlanService,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository) {
        this.mealPlanService = mealPlanService;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    @Operation(summary = "Create a meal plan for a patient")
    @PostMapping
    public ResponseEntity<MealPlan> create(@Valid @RequestBody MealPlanDTO dto) {
        Patient patient = patientRepository.findByUser_PublicId(dto.getPatientPublicId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        Doctor doctor = doctorRepository.findByUser_PublicId(dto.getDoctorPublicId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        MealPlan plan = new MealPlan();
        plan.setPatient(patient);
        plan.setDoctor(doctor);
        plan.setDiabetesType(dto.getDiabetesType());
        plan.setCalorieGoal(dto.getCalorieGoal());
        plan.setBreakfast(dto.getBreakfast());
        plan.setLunch(dto.getLunch());
        plan.setDinner(dto.getDinner());
        plan.setSnacks(dto.getSnacks());
        plan.setNotes(dto.getNotes());
        plan.setStartDate(dto.getStartDate());
        plan.setEndDate(dto.getEndDate());

        return ResponseEntity.ok(mealPlanService.create(plan));
    }

    @Operation(summary = "Get my meal plans", description = "Returns meal plans for authenticated patient or doctor")
    @GetMapping("/my")
    public ResponseEntity<List<MealPlan>> getMyMealPlans(Authentication authentication) {
        String email = authentication.getName();
        List<MealPlan> asPatient = mealPlanService.getByPatientEmail(email);
        if (!asPatient.isEmpty())
            return ResponseEntity.ok(asPatient);
        return ResponseEntity.ok(mealPlanService.getByDoctorEmail(email));
    }

    @Operation(summary = "Get all meal plans (doctor/admin)")
    @GetMapping("/all")
    public ResponseEntity<List<MealPlan>> getAll() {
        return ResponseEntity.ok(mealPlanService.getAll());
    }

    @Operation(summary = "Delete a meal plan")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        mealPlanService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
