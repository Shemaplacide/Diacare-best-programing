package com.auca.diacare.patient.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.auca.diacare.patient.model.Patient;

public interface PatientService {
    Patient registerPatient(Patient patient);

    Optional<Patient> getPatientByPublicId(UUID publicId);

    Optional<Patient> getPatientByEmail(String email);

    Patient updatePatientProfile(UUID publicId, Patient patientDetails);

    void deletePatient(UUID publicId);

    List<Patient> getAllPatients();
}
