package com.auca.diacare.patient.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.auca.diacare.patient.model.Patient;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    
    // finding patients by id, email, or username or dibetes type
    Optional<Patient> findByUser_PublicId(UUID publicId);
    Optional<Patient> findByUser_Id(Long userId);
    Optional<Patient> findByUserEmail(String email);
    Optional<Patient> findByUserUsername(String username);

    // this will be used just by doctors and anmins for analyzing patients with specific diabetes type
    List<Patient> findByDiabetesType(String diabetesType);
    
 
}
