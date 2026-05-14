package com.auca.diacare.auth.service;

import com.auca.diacare.auth.dto.AuthResponse;
import com.auca.diacare.auth.dto.LoginRequest;
import com.auca.diacare.auth.dto.RegisterRequest;
import com.auca.diacare.auth.model.Role;
import com.auca.diacare.auth.model.User;
import com.auca.diacare.auth.repository.UserRepository;
import com.auca.diacare.admin.model.Admin;
import com.auca.diacare.admin.model.ActivityLog;
import com.auca.diacare.admin.repository.AdminRepository;
import com.auca.diacare.admin.repository.ActivityLogRepository;
import com.auca.diacare.common.util.JwtUtil;
import com.auca.diacare.doctor.model.Doctor;
import com.auca.diacare.doctor.repository.DoctorRepository;
import com.auca.diacare.patient.model.Patient;
import com.auca.diacare.patient.repository.PatientRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AdminRepository adminRepository;
    private final ActivityLogRepository activityLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       PatientRepository patientRepository,
                       DoctorRepository doctorRepository,
                       AdminRepository adminRepository,
                       ActivityLogRepository activityLogRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.adminRepository = adminRepository;
        this.activityLogRepository = activityLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        // Resolve role: explicit role > is_doctor flag > default PATIENT
        Role role = request.getRole();
        if (role == null) {
            role = request.isIs_doctor() ? Role.DOCTOR : Role.PATIENT;
        }

        User user = new User(
                request.getName().trim(),
                request.getEmail().trim(),
                passwordEncoder.encode(request.getPassword()),
                role);
        userRepository.save(user);

        // Auto-create role-specific profile
        if (role == Role.PATIENT) {
            Patient patient = new Patient();
            patient.setUser(user);
            patient.setDiabetesType(request.getDiabetesType() != null ? request.getDiabetesType() : "Unknown");
            patient.setDateOfBirth(request.getDateOfBirth());
            patient.setGender(request.getGender());
            patient.setPhoneNumber(request.getPhoneNumber());
            patient.setHasAllergies(Boolean.TRUE.equals(request.getHasAllergies()));
            patient.setAllergyDetails(Boolean.TRUE.equals(request.getHasAllergies())
                    ? request.getAllergyDetails()
                    : null);
            if (request.getPreferredDoctorPublicId() != null) {
                Doctor preferredDoctor = doctorRepository.findByUser_PublicId(request.getPreferredDoctorPublicId())
                        .orElseThrow(() -> new RuntimeException("Preferred doctor not found"));
                patient.setPreferredDoctor(preferredDoctor);
            }
            patientRepository.save(patient);
        } else if (role == Role.DOCTOR) {
            Doctor doctor = new Doctor();
            doctor.setUser(user);
            doctor.setSpecialization(request.getSpecialization() != null ? request.getSpecialization() : "General");
            doctor.setLicenseNumber(request.getLicense_number() != null ? request.getLicense_number() : "N/A");
            doctorRepository.save(doctor);
        } else if (role == Role.ADMIN) {
            Admin admin = new Admin();
            admin.setUser(user);
            admin.setDepartment(request.getHospital() != null && !request.getHospital().isBlank()
                    ? request.getHospital()
                    : "Administration");
            adminRepository.save(admin);
        }

        String token = jwtUtil.generateToken(user);
        return new AuthResponse(token, user.getEmail(), user.getUsername(), user.getRole());
    }

    public AuthResponse login(LoginRequest request, String userAgent) {
        String identifier = request.getEmail().trim();
        User user = userRepository.findByEmail(identifier)
                .or(() -> userRepository.findByUsername(identifier))
                .orElse(null);

        if (user == null) {
            logAccess(identifier, null, "Unknown", "FAILED", userAgent, "Failed login: account not found");
            throw new RuntimeException("Invalid email or password");
        }

        if (!user.isActive()) {
            logAccess(user.getEmail(), user, portalFor(user.getRole()), "FAILED", userAgent, "Failed login: account deactivated");
            throw new RuntimeException("Account is deactivated");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            logAccess(user.getEmail(), user, portalFor(user.getRole()), "FAILED", userAgent, "Failed login: incorrect password");
            throw new RuntimeException("Invalid email or password");
        }

        logAccess(user.getEmail(), user, portalFor(user.getRole()), "SUCCESS", userAgent, "Logged in");
        String token = jwtUtil.generateToken(user);
        return new AuthResponse(token, user.getEmail(), user.getUsername(), user.getRole());
    }

    public AuthResponse login(LoginRequest request) {
        return login(request, "Unknown");
    }

    public void logout(String email, String userAgent) {
        activityLogRepository.findTop1ByEmailAndLoginStatusOrderByLoginAtDesc(email, "SUCCESS")
                .stream()
                .filter(log -> log.getLogoutAt() == null)
                .findFirst()
                .ifPresent(log -> {
                    log.setLogoutAt(java.time.LocalDateTime.now());
                    log.setRecentActivity("Logged out");
                    log.setDeviceOrBrowser(userAgent);
                    activityLogRepository.save(log);
                });
    }

    private void logAccess(String identifier, User user, String portal, String status, String userAgent, String activity) {
        ActivityLog log = new ActivityLog();
        log.setFullName(user != null ? user.getUsername() : identifier);
        log.setEmail(user != null ? user.getEmail() : identifier);
        log.setRole(user != null ? user.getRole() : null);
        log.setPortalAccessed(portal);
        log.setLoginAt(java.time.LocalDateTime.now());
        log.setLoginStatus(status);
        log.setDeviceOrBrowser(userAgent);
        log.setRecentActivity(activity);
        activityLogRepository.save(log);
    }

    private String portalFor(Role role) {
        if (role == Role.ADMIN) return "Admin Portal";
        if (role == Role.DOCTOR) return "Doctor Portal";
        return "Patient Portal";
    }

    public void changePassword(User user, String currentPassword, String newPassword) {
        if (!passwordEncoder.matches(currentPassword, user.getPassword()))
            throw new RuntimeException("Current password is incorrect");
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
