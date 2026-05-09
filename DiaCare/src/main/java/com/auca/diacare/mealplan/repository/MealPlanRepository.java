package com.auca.diacare.mealplan.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.auca.diacare.mealplan.model.MealPlan;

@Repository
public interface MealPlanRepository extends JpaRepository<MealPlan, Long> {
    List<MealPlan> findByPatient_User_EmailOrderByCreatedAtDesc(String email);
    List<MealPlan> findByDoctor_User_EmailOrderByCreatedAtDesc(String email);
}
