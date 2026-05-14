package com.auca.diacare.admin.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.auca.diacare.admin.dto.AdminDTO;
import com.auca.diacare.admin.model.Admin;
import com.auca.diacare.admin.repository.AdminRepository;
import com.auca.diacare.admin.model.ActivityLog;
import com.auca.diacare.admin.repository.ActivityLogRepository;
import com.auca.diacare.admin.service.AdminService;
import com.auca.diacare.appointment.model.Appointment;
import com.auca.diacare.appointment.repository.AppointmentRepository;
import com.auca.diacare.auth.model.User;
import com.auca.diacare.auth.model.Role;
import com.auca.diacare.auth.repository.UserRepository;
import com.auca.diacare.auth.service.AuthService;
import com.auca.diacare.chat.model.Conversation;
import com.auca.diacare.chat.repository.ChatMessageRepository;
import com.auca.diacare.chat.repository.ConversationRepository;
import com.auca.diacare.doctor.repository.DoctorRepository;
import com.auca.diacare.glucose.model.GlucoseReading;
import com.auca.diacare.glucose.repository.GlucoseReadingRepository;
import com.auca.diacare.metrics.model.HealthMetrics;
import com.auca.diacare.metrics.repository.HealthMetricsRepository;
import com.auca.diacare.mealplan.repository.MealPlanRepository;
import com.auca.diacare.notification.repository.NotificationRepository;
import com.auca.diacare.patient.model.Patient;
import com.auca.diacare.patient.repository.PatientRepository;
import com.auca.diacare.prescription.repository.PrescriptionRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/admin")
@Tag(name = "Admin", description = "Admin profile management and user administration")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final AdminService adminService;
    private final AdminRepository adminRepository;
    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final GlucoseReadingRepository glucoseRepository;
    private final HealthMetricsRepository metricsRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final MealPlanRepository mealPlanRepository;
    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final NotificationRepository notificationRepository;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    public AdminController(AdminService adminService, AdminRepository adminRepository,
            ActivityLogRepository activityLogRepository, UserRepository userRepository,
            PatientRepository patientRepository, DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository,
            GlucoseReadingRepository glucoseRepository,
            HealthMetricsRepository metricsRepository,
            PrescriptionRepository prescriptionRepository,
            MealPlanRepository mealPlanRepository,
            ConversationRepository conversationRepository,
            ChatMessageRepository chatMessageRepository,
            NotificationRepository notificationRepository,
            AuthService authService,
            PasswordEncoder passwordEncoder) {
        this.adminService = adminService;
        this.adminRepository = adminRepository;
        this.activityLogRepository = activityLogRepository;
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.glucoseRepository = glucoseRepository;
        this.metricsRepository = metricsRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.mealPlanRepository = mealPlanRepository;
        this.conversationRepository = conversationRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.notificationRepository = notificationRepository;
        this.authService = authService;
        this.passwordEncoder = passwordEncoder;
    }

    @Operation(summary = "Register admin profile")
    @PostMapping
    public ResponseEntity<Admin> register(@Valid @RequestBody AdminDTO dto) {
        User user = userRepository.findByPublicId(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Admin admin = new Admin();
        admin.setUser(user);
        admin.setDepartment(dto.getDepartment());
        return ResponseEntity.ok(adminService.registerAdmin(admin));
    }

    @Operation(summary = "Get admin by public ID")
    @GetMapping("/me")
    public ResponseEntity<Admin> getMyProfile(Authentication authentication) {
        return adminRepository.findByUserEmail(authentication.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Update my admin profile")
    @PutMapping("/me")
    public ResponseEntity<Admin> updateMyProfile(Authentication authentication, @RequestBody AdminDTO dto) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Admin admin = adminRepository.findByUserEmail(authentication.getName())
                .orElseGet(() -> {
                    Admin created = new Admin();
                    created.setUser(user);
                    return created;
                });
        admin.setDepartment(dto.getDepartment() == null || dto.getDepartment().isBlank()
                ? "Administration"
                : dto.getDepartment());
        return ResponseEntity.ok(adminRepository.save(admin));
    }

    @Operation(summary = "Get admin by public ID")
    @GetMapping("/{publicId}")
    public ResponseEntity<Admin> getByPublicId(@PathVariable UUID publicId) {
        return adminService.getAdminByPublicId(publicId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Update admin profile")
    @PutMapping("/{publicId}")
    public ResponseEntity<Admin> update(@PathVariable UUID publicId, @Valid @RequestBody AdminDTO dto) {
        Admin details = new Admin();
        details.setDepartment(dto.getDepartment());
        return ResponseEntity.ok(adminService.updateAdmin(publicId, details));
    }

    @Operation(summary = "Delete admin")
    @DeleteMapping("/{publicId}")
    public ResponseEntity<Void> delete(@PathVariable UUID publicId) {
        adminService.deleteAdmin(publicId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get admin dashboard stats")
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @Operation(summary = "Get user access activity logs")
    @GetMapping("/activity-logs")
    public ResponseEntity<List<ActivityLog>> getActivityLogs() {
        return ResponseEntity.ok(activityLogRepository.findAll().stream()
                .sorted((a, b) -> b.getLoginAt().compareTo(a.getLoginAt()))
                .toList());
    }

    // User management
    @Operation(summary = "List all users")
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @Operation(summary = "Deactivate a user account")
    @PutMapping("/users/{publicId}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable UUID publicId) {
        adminService.deactivateUser(publicId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Activate a user account")
    @PutMapping("/users/{publicId}/activate")
    public ResponseEntity<Void> activate(@PathVariable UUID publicId) {
        adminService.activateUser(publicId);
        return ResponseEntity.noContent().build();
    }

    // ── Data endpoints ────────────────────────────────────────────────────

    @Operation(summary = "Get all staff (DOCTOR + ADMIN users)")
    @GetMapping("/staff")
    public ResponseEntity<List<User>> getAllStaff() {
        return ResponseEntity.ok(userRepository.findAll().stream()
                .filter(u -> u.getRole() != com.auca.diacare.auth.model.Role.PATIENT)
                .toList());
    }

    @Operation(summary = "Create a staff member (DOCTOR or ADMIN) in one call")
    @PostMapping("/staff")
    public ResponseEntity<User> createStaff(@RequestBody Map<String, String> body) {
        com.auca.diacare.auth.dto.RegisterRequest req = new com.auca.diacare.auth.dto.RegisterRequest();
        req.setName(body.get("name"));
        req.setEmail(body.get("email"));
        req.setPassword(body.getOrDefault("password", "Staff@123"));
        req.setRole(com.auca.diacare.auth.model.Role.valueOf(body.getOrDefault("role", "DOCTOR")));
        req.setSpecialization(body.get("specialization"));
        req.setLicense_number(body.get("licenseNumber"));
        req.setHospital(body.get("department"));
        authService.register(req);
        User created = userRepository.findByEmail(body.get("email"))
                .orElseThrow(() -> new RuntimeException("User not found after creation"));
        return ResponseEntity.ok(created);
    }

    @Operation(summary = "Update a staff member account")
    @PutMapping("/staff/{publicId}")
    @Transactional
    public ResponseEntity<User> updateStaff(@PathVariable UUID publicId, @RequestBody Map<String, Object> body) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() == Role.PATIENT) {
            throw new RuntimeException("Use the patient update endpoint for patient accounts");
        }

        updateUserAccount(user, body);

        if (user.getRole() == Role.DOCTOR) {
            com.auca.diacare.doctor.model.Doctor doctor = doctorRepository.findByUser_PublicId(publicId)
                    .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
            updateDoctorFields(doctor, body);
            doctorRepository.save(doctor);
        }

        if (user.getRole() == Role.ADMIN) {
            Admin admin = adminRepository.findByUser_PublicId(publicId)
                    .orElseGet(() -> {
                        Admin created = new Admin();
                        created.setUser(user);
                        return created;
                    });
            if (body.get("department") != null && !body.get("department").toString().isBlank()) {
                admin.setDepartment(body.get("department").toString().trim());
            } else if (admin.getDepartment() == null || admin.getDepartment().isBlank()) {
                admin.setDepartment("Administration");
            }
            adminRepository.save(admin);
        }

        return ResponseEntity.ok(userRepository.save(user));
    }

    @Operation(summary = "Delete a staff member")
    @DeleteMapping("/staff/{publicId}")
    @Transactional
    public ResponseEntity<Void> deleteStaff(@PathVariable UUID publicId) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        deleteUserAccount(user);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Update a doctor account and professional profile")
    @PutMapping("/doctors/{publicId}")
    @Transactional
    public ResponseEntity<com.auca.diacare.doctor.model.Doctor> updateDoctor(
            @PathVariable UUID publicId,
            @RequestBody Map<String, Object> body) {
        com.auca.diacare.doctor.model.Doctor doctor = doctorRepository.findByUser_PublicId(publicId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        User user = doctor.getUser();

        updateUserAccount(user, body);
        updateDoctorFields(doctor, body);

        userRepository.save(user);
        return ResponseEntity.ok(doctorRepository.save(doctor));
    }

    @Operation(summary = "Delete a doctor account and related doctor data")
    @DeleteMapping("/doctors/{publicId}")
    @Transactional
    public ResponseEntity<Void> deleteDoctor(@PathVariable UUID publicId) {
        com.auca.diacare.doctor.model.Doctor doctor = doctorRepository.findByUser_PublicId(publicId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        deleteUserAccount(doctor.getUser());
        return ResponseEntity.noContent().build();
    }

    private void deleteDoctorProfileData(com.auca.diacare.doctor.model.Doctor doctor) {
        patientRepository.findByPreferredDoctor_Id(doctor.getId()).forEach(patient -> {
            patient.setPreferredDoctor(null);
            patientRepository.save(patient);
        });

        User user = doctor.getUser();
        prescriptionRepository.deleteAll(prescriptionRepository.findByDoctor_User_Email(user.getEmail()));
        mealPlanRepository.deleteAll(mealPlanRepository.findByDoctor_User_EmailOrderByCreatedAtDesc(user.getEmail()));
        appointmentRepository.deleteAll(appointmentRepository.findByDoctor_User_Email(user.getEmail()));
        doctorRepository.delete(doctor);
    }

    private void deleteUserCommunicationData(User user) {
        List<Conversation> conversations = conversationRepository.findAllByParticipant(user.getEmail());
        chatMessageRepository.deleteAll(chatMessageRepository.findBySender_Email(user.getEmail()));
        conversations.forEach(conversation ->
                chatMessageRepository.deleteAll(chatMessageRepository.findByConversation_Id(conversation.getId())));
        conversationRepository.deleteAll(conversations);
        notificationRepository.deleteAll(notificationRepository.findByRecipient_Email(user.getEmail()));
    }

    private void updateUserAccount(User user, Map<String, Object> body) {
        if (body.get("name") != null && !body.get("name").toString().isBlank()) {
            user.setUsername(body.get("name").toString().trim());
        }

        if (body.get("email") != null && !body.get("email").toString().isBlank()) {
            String email = body.get("email").toString().trim();
            userRepository.findByEmail(email)
                    .filter(existing -> !existing.getId().equals(user.getId()))
                    .ifPresent(existing -> {
                        throw new RuntimeException("Email already in use");
                    });
            user.setEmail(email);
        }

        if (body.get("password") != null && !body.get("password").toString().isBlank()) {
            user.setPassword(passwordEncoder.encode(body.get("password").toString()));
        }
    }

    private void updateDoctorFields(com.auca.diacare.doctor.model.Doctor doctor, Map<String, Object> body) {
        if (body.get("specialization") != null && !body.get("specialization").toString().isBlank()) {
            doctor.setSpecialization(body.get("specialization").toString().trim());
        }

        if (body.get("licenseNumber") != null && !body.get("licenseNumber").toString().isBlank()) {
            String licenseNumber = body.get("licenseNumber").toString().trim();
            doctorRepository.findByLicenseNumber(licenseNumber)
                    .filter(existing -> !existing.getId().equals(doctor.getId()))
                    .ifPresent(existing -> {
                        throw new RuntimeException("License number already in use");
                    });
            doctor.setLicenseNumber(licenseNumber);
        }

        if (body.get("yearsOfExperience") != null && !body.get("yearsOfExperience").toString().isBlank()) {
            doctor.setYearsOfExperience(Integer.valueOf(body.get("yearsOfExperience").toString()));
        }
    }

    private void deleteUserAccount(User user) {
        if (user.getRole() == Role.ADMIN) {
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.ADMIN)
                    .count();
            if (adminCount <= 1) {
                throw new RuntimeException("Cannot delete the last admin account");
            }
        }

        patientRepository.findByUser_Id(user.getId()).ifPresent(this::deletePatientProfileData);
        doctorRepository.findByUser_Id(user.getId()).ifPresent(this::deleteDoctorProfileData);
        adminRepository.findByUser_Id(user.getId()).ifPresent(adminRepository::delete);
        patientRepository.flush();
        doctorRepository.flush();
        adminRepository.flush();
        deleteUserCommunicationData(user);
        userRepository.delete(user);
        userRepository.flush();
    }

    @Operation(summary = "Get all patients")
    @GetMapping("/patients")
    public ResponseEntity<List<Patient>> getAllPatients() {
        return ResponseEntity.ok(patientRepository.findAll());
    }

    @Operation(summary = "Delete a patient")
    @DeleteMapping("/patients/{id}")
    @Transactional
    public ResponseEntity<Void> deletePatient(@PathVariable Long id) {
        Patient patient = patientRepository.findById(id).orElseThrow(() -> new RuntimeException("Patient not found"));
        deleteUserAccount(patient.getUser());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Update a patient account and health profile")
    @PutMapping("/patients/{id}")
    public ResponseEntity<Patient> updatePatient(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        User user = patient.getUser();

        updateUserAccount(user, body);

        if (body.get("diabetesType") != null)
            patient.setDiabetesType(body.get("diabetesType").toString());
        if (body.get("dateOfBirth") != null && !body.get("dateOfBirth").toString().isBlank())
            patient.setDateOfBirth(java.time.LocalDate.parse(body.get("dateOfBirth").toString()));
        if (body.get("gender") != null)
            patient.setGender(body.get("gender").toString());
        if (body.get("targetHbA1c") != null && !body.get("targetHbA1c").toString().isBlank())
            patient.setTargetHbA1c(Double.valueOf(body.get("targetHbA1c").toString()));
        if (body.get("phoneNumber") != null)
            patient.setPhoneNumber(body.get("phoneNumber").toString());
        if (body.get("hasAllergies") != null)
            patient.setHasAllergies(Boolean.valueOf(body.get("hasAllergies").toString()));
        if (body.get("allergyDetails") != null)
            patient.setAllergyDetails(body.get("allergyDetails").toString());
        if (Boolean.FALSE.equals(patient.getHasAllergies()))
            patient.setAllergyDetails(null);
        if (body.get("preferredDoctorPublicId") != null && !body.get("preferredDoctorPublicId").toString().isBlank()) {
            patient.setPreferredDoctor(doctorRepository.findByUser_PublicId(UUID.fromString(body.get("preferredDoctorPublicId").toString()))
                    .orElseThrow(() -> new RuntimeException("Preferred doctor not found")));
        }

        userRepository.save(user);
        return ResponseEntity.ok(patientRepository.save(patient));
    }

    private void deletePatientProfileData(Patient patient) {
        User user = patient.getUser();
        prescriptionRepository.deleteAll(prescriptionRepository.findByPatient_User_Email(user.getEmail()));
        mealPlanRepository.deleteAll(mealPlanRepository.findByPatient_User_EmailOrderByCreatedAtDesc(user.getEmail()));
        glucoseRepository.deleteAll(glucoseRepository.findByPatient_User_Email(user.getEmail()));
        metricsRepository.deleteAll(metricsRepository.findByPatient_User_Email(user.getEmail()));
        appointmentRepository.deleteAll(appointmentRepository.findByPatient_User_Email(user.getEmail()));
        patientRepository.delete(patient);
    }

    @Operation(summary = "Get all appointments")
    @GetMapping("/appointments")
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        return ResponseEntity.ok(appointmentRepository.findAll());
    }

    @Operation(summary = "Admin: book an appointment for any patient")
    @PostMapping("/appointments")
    public ResponseEntity<Appointment> createAppointment(@RequestBody Map<String, Object> body) {
        Long patientId = Long.valueOf(body.get("patientId").toString());
        Long doctorId  = Long.valueOf(body.get("doctorId").toString());
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        com.auca.diacare.doctor.model.Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        Appointment apt = new Appointment();
        apt.setPatient(patient);
        apt.setDoctor(doctor);
        apt.setAppointmentDate(java.time.LocalDateTime.parse(body.get("appointmentDate").toString()));
        apt.setNotes(body.getOrDefault("notes", "").toString());
        apt.setStatus(Appointment.Status.valueOf(body.getOrDefault("status", "CONFIRMED").toString()));
        return ResponseEntity.ok(appointmentRepository.save(apt));
    }

    @Operation(summary = "Delete an appointment")
    @DeleteMapping("/appointments/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        appointmentRepository.findById(id).orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointmentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get all glucose readings")
    @GetMapping("/glucose")
    public ResponseEntity<List<GlucoseReading>> getAllGlucose() {
        return ResponseEntity.ok(glucoseRepository.findAll());
    }

    @Operation(summary = "Admin: log a glucose reading for any patient")
    @PostMapping("/glucose")
    public ResponseEntity<GlucoseReading> logGlucose(@RequestBody Map<String, Object> body) {
        Long patientId = Long.valueOf(body.get("patientId").toString());
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        GlucoseReading gr = new GlucoseReading();
        gr.setPatient(patient);
        gr.setValue(Double.valueOf(body.get("value").toString()));
        gr.setUnit(GlucoseReading.Unit.valueOf(body.getOrDefault("unit", "MMOL_L").toString()));
        gr.setMealContext(GlucoseReading.MealContext.valueOf(body.get("mealContext").toString()));
        if (body.get("recordedAt") != null)
            gr.setRecordedAt(java.time.LocalDateTime.parse(body.get("recordedAt").toString()));
        if (body.get("notes") != null) gr.setNotes(body.get("notes").toString());
        return ResponseEntity.ok(glucoseRepository.save(gr));
    }

    @Operation(summary = "Delete a glucose reading")
    @DeleteMapping("/glucose/{id}")
    public ResponseEntity<Void> deleteGlucose(@PathVariable Long id) {
        glucoseRepository.findById(id).orElseThrow(() -> new RuntimeException("Reading not found"));
        glucoseRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get all health metrics")
    @GetMapping("/metrics")
    public ResponseEntity<List<HealthMetrics>> getAllMetrics() {
        return ResponseEntity.ok(metricsRepository.findAll());
    }

    @Operation(summary = "Admin: record health metrics for any patient")
    @PostMapping("/metrics")
    public ResponseEntity<HealthMetrics> logMetrics(@RequestBody Map<String, Object> body) {
        Long patientId = Long.valueOf(body.get("patientId").toString());
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        HealthMetrics m = new HealthMetrics();
        m.setPatient(patient);
        if (body.get("weight")   != null) m.setWeight(Double.valueOf(body.get("weight").toString()));
        if (body.get("height")   != null) m.setHeight(Double.valueOf(body.get("height").toString()));
        if (body.get("hba1c")    != null) m.setHba1c(Double.valueOf(body.get("hba1c").toString()));
        if (body.get("systolic") != null) m.setBloodPressureSystolic(Integer.valueOf(body.get("systolic").toString()));
        if (body.get("diastolic")!= null) m.setBloodPressureDiastolic(Integer.valueOf(body.get("diastolic").toString()));
        if (body.get("cholesterol") != null) m.setCholesterol(Double.valueOf(body.get("cholesterol").toString()));
        if (body.get("recordedAt")  != null) m.setRecordedAt(java.time.LocalDateTime.parse(body.get("recordedAt").toString()));
        return ResponseEntity.ok(metricsRepository.save(m));
    }
}
