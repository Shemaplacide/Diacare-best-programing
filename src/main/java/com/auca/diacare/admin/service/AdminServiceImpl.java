package com.auca.diacare.admin.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.auca.diacare.admin.model.Admin;
import com.auca.diacare.admin.repository.AdminRepository;
import com.auca.diacare.appointment.repository.AppointmentRepository;
import com.auca.diacare.auth.model.User;
import com.auca.diacare.auth.repository.UserRepository;
import com.auca.diacare.doctor.repository.DoctorRepository;
import com.auca.diacare.glucose.repository.GlucoseReadingRepository;
import com.auca.diacare.patient.repository.PatientRepository;

@Service
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final GlucoseReadingRepository glucoseRepository;

    public AdminServiceImpl(AdminRepository adminRepository,
            UserRepository userRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository,
            GlucoseReadingRepository glucoseRepository) {
        this.adminRepository = adminRepository;
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.glucoseRepository = glucoseRepository;
    }

    @Override
    public Admin registerAdmin(Admin admin) {
        return adminRepository.save(admin);
    }

    @Override
    public Optional<Admin> getAdminByPublicId(UUID publicId) {
        return adminRepository.findByUser_PublicId(publicId);
    }

    @Override
    public Admin updateAdmin(UUID publicId, Admin adminDetails) {
        Admin admin = adminRepository.findByUser_PublicId(publicId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        admin.setDepartment(adminDetails.getDepartment());
        return adminRepository.save(admin);
    }

    @Override
    public void deleteAdmin(UUID publicId) {
        Admin admin = adminRepository.findByUser_PublicId(publicId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        adminRepository.delete(admin);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public void deactivateUser(UUID userPublicId) {
        User user = userRepository.findByPublicId(userPublicId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(false);
        userRepository.save(user);
    }

    @Override
    public void activateUser(UUID userPublicId) {
        User user = userRepository.findByPublicId(userPublicId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(true);
        userRepository.save(user);
    }

    @Override
    public Map<String, Object> getDashboardStats() {
        long totalPatients = patientRepository.count();
        long totalDoctors = doctorRepository.count();
        long totalAppointments = appointmentRepository.count();
        long todayAppointments = appointmentRepository.findAll().stream()
                .filter(a -> a.getAppointmentDate().toLocalDate().equals(java.time.LocalDate.now()))
                .count();

        // Critical glucose readings in last 24h
        java.time.LocalDateTime since = LocalDateTime.now().minusHours(24);
        long criticalGlucose = patientRepository.findAll().stream()
                .flatMap(p -> glucoseRepository
                        .findByPatient_IdAndRecordedAtBetweenOrderByRecordedAtAsc(p.getId(), since, LocalDateTime.now())
                        .stream())
                .filter(r -> r.getValue() >= 13.9 || r.getValue() <= 3.0)
                .count();

        return Map.of(
                "totalPatients", totalPatients,
                "totalDoctors", totalDoctors,
                "totalAppointments", totalAppointments,
                "todayAppointments", todayAppointments,
                "criticalGlucose", criticalGlucose);
    }
}
