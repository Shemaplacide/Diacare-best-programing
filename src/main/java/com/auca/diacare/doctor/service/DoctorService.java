package com.auca.diacare.doctor.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.auca.diacare.doctor.dto.DoctorDashboardResponse;
import com.auca.diacare.doctor.model.Doctor;

public interface DoctorService {
    Doctor registerDoctor(Doctor doctor);
    Optional<Doctor> getDoctorByPublicId(UUID publicId);
    Optional<Doctor> getDoctorByEmail(String email);
    List<Doctor> getAllDoctors();
    List<Doctor> getDoctorsBySpecialization(String specialization);
    Doctor updateDoctorProfile(UUID publicId, Doctor doctorDetails);
    void deleteDoctor(UUID publicId);
    DoctorDashboardResponse getDashboard(String doctorEmail);
}
