package com.auca.diacare.prescription.service;

import java.util.List;
import java.util.Optional;

import com.auca.diacare.prescription.model.Prescription;

public interface PrescriptionService {
    Prescription createPrescription(Prescription prescription);

    Optional<Prescription> getPrescriptionById(Long id);

    List<Prescription> getPrescriptionsByPatientEmail(String email);

    List<Prescription> getPrescriptionsByDoctorEmail(String email);

    List<Prescription> getPrescriptionsByAppointment(Long appointmentId);

    List<Prescription> getAllPrescriptions();

    Prescription updatePrescription(Long id, Prescription details);

    void deletePrescription(Long id);
}
