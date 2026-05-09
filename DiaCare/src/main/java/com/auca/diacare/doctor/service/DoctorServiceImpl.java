package com.auca.diacare.doctor.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.auca.diacare.appointment.model.Appointment;
import com.auca.diacare.appointment.model.Appointment.Status;
import com.auca.diacare.appointment.repository.AppointmentRepository;
import com.auca.diacare.doctor.dto.DoctorDashboardResponse;
import com.auca.diacare.doctor.dto.DoctorDashboardResponse.CriticalAlert;
import com.auca.diacare.doctor.model.Doctor;
import com.auca.diacare.doctor.repository.DoctorRepository;
import com.auca.diacare.glucose.model.GlucoseReading;
import com.auca.diacare.glucose.repository.GlucoseReadingRepository;
import com.auca.diacare.patient.model.Patient;
import com.auca.diacare.patient.repository.PatientRepository;

@Service
public class DoctorServiceImpl implements DoctorService {

    // Critical glucose thresholds in mmol/L
    private static final double CRITICAL_HIGH = 13.9;
    private static final double CRITICAL_LOW = 3.0;

    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final GlucoseReadingRepository glucoseRepository;

    public DoctorServiceImpl(DoctorRepository doctorRepository,
                              AppointmentRepository appointmentRepository,
                              PatientRepository patientRepository,
                              GlucoseReadingRepository glucoseRepository) {
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.glucoseRepository = glucoseRepository;
    }

    @Override
    public Doctor registerDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    @Override
    public Optional<Doctor> getDoctorByPublicId(UUID publicId) {
        return doctorRepository.findByUser_PublicId(publicId);
    }

    @Override
    public Optional<Doctor> getDoctorByEmail(String email) {
        return doctorRepository.findByUserEmail(email);
    }

    @Override
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    @Override
    public List<Doctor> getDoctorsBySpecialization(String specialization) {
        return doctorRepository.findBySpecialization(specialization);
    }

    @Override
    public Doctor updateDoctorProfile(UUID publicId, Doctor doctorDetails) {
        Doctor doctor = doctorRepository.findByUser_PublicId(publicId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        doctor.setSpecialization(doctorDetails.getSpecialization());
        doctor.setLicenseNumber(doctorDetails.getLicenseNumber());
        doctor.setYearsOfExperience(doctorDetails.getYearsOfExperience());
        return doctorRepository.save(doctor);
    }

    @Override
    public void deleteDoctor(UUID publicId) {
        Doctor doctor = doctorRepository.findByUser_PublicId(publicId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        doctorRepository.delete(doctor);
    }

    @Override
    public DoctorDashboardResponse getDashboard(String doctorEmail) {
        Doctor doctor = doctorRepository.findByUserEmail(doctorEmail).orElse(null);
        if (doctor == null) {
            // User is authenticated but has no doctor profile yet — return empty dashboard
            DoctorDashboardResponse empty = new DoctorDashboardResponse();
            empty.setTotalPatients(0);
            empty.setTodayAppointments(0);
            empty.setPendingAppointments(0);
            empty.setUpcomingAppointments(List.of());
            empty.setCriticalAlerts(List.of());
            return empty;
        }

        // Today's appointment window
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        List<Appointment> allAppointments = appointmentRepository.findByDoctor_User_Email(doctorEmail);
        List<Appointment> todayAppointments = allAppointments.stream()
                .filter(a -> !a.getAppointmentDate().isBefore(startOfDay)
                          && a.getAppointmentDate().isBefore(endOfDay))
                .toList();
        List<Appointment> pending = allAppointments.stream()
                .filter(a -> a.getStatus() == Status.PENDING)
                .toList();
        List<Appointment> upcoming = allAppointments.stream()
                .filter(a -> a.getAppointmentDate().isAfter(LocalDateTime.now())
                          && a.getStatus() != Status.CANCELLED)
                .limit(10)
                .toList();

        // Critical glucose alerts from last 24 hours across all patients
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        List<Patient> allPatients = patientRepository.findAll();
        List<CriticalAlert> alerts = allPatients.stream()
                .flatMap(p -> glucoseRepository
                        .findByPatient_IdAndRecordedAtBetweenOrderByRecordedAtAsc(p.getId(), since, LocalDateTime.now())
                        .stream()
                        .filter(r -> r.getValue() >= CRITICAL_HIGH || r.getValue() <= CRITICAL_LOW)
                        .map(r -> new CriticalAlert(
                                p.getUser().getUsername(),
                                p.getUser().getEmail(),
                                r.getValue(),
                                r.getUnit().name(),
                                r.getValue() >= CRITICAL_HIGH ? "CRITICAL HIGH" : "CRITICAL LOW",
                                r.getRecordedAt().toString())))
                .toList();

        DoctorDashboardResponse response = new DoctorDashboardResponse();
        response.setTotalPatients(allPatients.size());
        response.setTodayAppointments(todayAppointments.size());
        response.setPendingAppointments(pending.size());
        response.setUpcomingAppointments(upcoming);
        response.setCriticalAlerts(alerts);
        return response;
    }
}
