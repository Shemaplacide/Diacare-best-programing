package com.auca.diacare.auth.service;

import com.auca.diacare.auth.dto.AuthResponse;
import com.auca.diacare.auth.dto.LoginRequest;
import com.auca.diacare.auth.dto.RegisterRequest;
import com.auca.diacare.auth.model.Role;
import com.auca.diacare.auth.model.User;
import com.auca.diacare.auth.repository.UserRepository;
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
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       PatientRepository patientRepository,
                       DoctorRepository doctorRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
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
            patient.setDiabetesType("Unknown");
            patientRepository.save(patient);
        } else if (role == Role.DOCTOR) {
            Doctor doctor = new Doctor();
            doctor.setUser(user);
            doctor.setSpecialization(request.getSpecialization() != null ? request.getSpecialization() : "General");
            doctor.setLicenseNumber(request.getLicense_number() != null ? request.getLicense_number() : "N/A");
            doctorRepository.save(doctor);
        }

        String token = jwtUtil.generateToken(user);
        return new AuthResponse(token, user.getEmail(), user.getUsername(), user.getRole());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!user.isActive()) {
            throw new RuntimeException("Account is deactivated");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user);
        return new AuthResponse(token, user.getEmail(), user.getUsername(), user.getRole());
    }

    public void changePassword(User user, String currentPassword, String newPassword) {
        if (!passwordEncoder.matches(currentPassword, user.getPassword()))
            throw new RuntimeException("Current password is incorrect");
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
