package com.auca.diacare.prescription.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.auca.diacare.prescription.model.Prescription;
import com.auca.diacare.prescription.repository.PrescriptionRepository;

@Service
public class PrescriptionServiceImpl implements PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;

    public PrescriptionServiceImpl(PrescriptionRepository prescriptionRepository) {
        this.prescriptionRepository = prescriptionRepository;
    }

    @Override
    public Prescription createPrescription(Prescription prescription) {
        return prescriptionRepository.save(prescription);
    }

    @Override
    public Optional<Prescription> getPrescriptionById(Long id) {
        return prescriptionRepository.findById(id);
    }

    @Override
    public List<Prescription> getPrescriptionsByPatientEmail(String email) {
        return prescriptionRepository.findByPatient_User_Email(email);
    }

    @Override
    public List<Prescription> getPrescriptionsByDoctorEmail(String email) {
        return prescriptionRepository.findByDoctor_User_Email(email);
    }

    @Override
    public List<Prescription> getPrescriptionsByAppointment(Long appointmentId) {
        return prescriptionRepository.findByAppointment_Id(appointmentId);
    }

    @Override
    public List<Prescription> getAllPrescriptions() {
        return prescriptionRepository.findAll();
    }

    @Override
    public Prescription updatePrescription(Long id, Prescription details) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        prescription.setMedication(details.getMedication());
        prescription.setDosage(details.getDosage());
        prescription.setInstructions(details.getInstructions());
        prescription.setStartDate(details.getStartDate());
        prescription.setEndDate(details.getEndDate());

        return prescriptionRepository.save(prescription);
    }

    @Override
    public void deletePrescription(Long id) {
        prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));
        prescriptionRepository.deleteById(id);
    }
}
