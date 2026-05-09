package com.auca.diacare.mealplan.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.auca.diacare.mealplan.model.MealPlan;
import com.auca.diacare.mealplan.repository.MealPlanRepository;

@Service
public class MealPlanService {

    private final MealPlanRepository repository;

    public MealPlanService(MealPlanRepository repository) {
        this.repository = repository;
    }

    public MealPlan create(MealPlan mealPlan) {
        return repository.save(mealPlan);
    }

    public List<MealPlan> getByPatientEmail(String email) {
        return repository.findByPatient_User_EmailOrderByCreatedAtDesc(email);
    }

    public List<MealPlan> getByDoctorEmail(String email) {
        return repository.findByDoctor_User_EmailOrderByCreatedAtDesc(email);
    }

    public List<MealPlan> getAll() {
        return repository.findAll();
    }

    public void delete(Long id) {
        repository.findById(id).orElseThrow(() -> new RuntimeException("Meal plan not found"));
        repository.deleteById(id);
    }
}
