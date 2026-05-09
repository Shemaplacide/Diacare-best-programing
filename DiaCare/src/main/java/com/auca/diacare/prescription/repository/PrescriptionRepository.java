package com.auca.diacare.prescription.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.auca.diacare.prescription.model.Prescription;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByPatient_User_Email(String email);
    List<Prescription> findByDoctor_User_Email(String email);
    List<Prescription> findByAppointment_Id(Long appointmentId);
}
