package com.auca.diacare.admin.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
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
import com.auca.diacare.admin.service.AdminService;
import com.auca.diacare.appointment.model.Appointment;
import com.auca.diacare.appointment.repository.AppointmentRepository;
import com.auca.diacare.auth.model.User;
import com.auca.diacare.auth.repository.UserRepository;
import com.auca.diacare.auth.service.AuthService;
import com.auca.diacare.doctor.repository.DoctorRepository;
import com.auca.diacare.glucose.model.GlucoseReading;
import com.auca.diacare.glucose.repository.GlucoseReadingRepository;
import com.auca.diacare.metrics.model.HealthMetrics;
import com.auca.diacare.metrics.repository.HealthMetricsRepository;
import com.auca.diacare.patient.model.Patient;
import com.auca.diacare.patient.repository.PatientRepository;

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
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final GlucoseReadingRepository glucoseRepository;
    private final HealthMetricsRepository metricsRepository;
    private final AuthService authService;

    public AdminController(AdminService adminService, UserRepository userRepository,
            PatientRepository patientRepository, DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository,
            GlucoseReadingRepository glucoseRepository,
            HealthMetricsRepository metricsRepository,
            AuthService authService) {
        this.adminService = adminService;
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.glucoseRepository = glucoseRepository;
        this.metricsRepository = metricsRepository;
        this.authService = authService;
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
        authService.register(req);
        User created = userRepository.findByEmail(body.get("email"))
                .orElseThrow(() -> new RuntimeException("User not found after creation"));
        if (created.getRole() == com.auca.diacare.auth.model.Role.ADMIN) {
            com.auca.diacare.admin.model.Admin admin = new com.auca.diacare.admin.model.Admin();
            admin.setUser(created);
            admin.setDepartment(body.getOrDefault("department", "Administration"));
            adminService.registerAdmin(admin);
        }
        return ResponseEntity.ok(created);
    }

    @Operation(summary = "Delete a staff member")
    @DeleteMapping("/staff/{publicId}")
    public ResponseEntity<Void> deleteStaff(@PathVariable UUID publicId) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get all patients")
    @GetMapping("/patients")
    public ResponseEntity<List<Patient>> getAllPatients() {
        return ResponseEntity.ok(patientRepository.findAll());
    }

    @Operation(summary = "Delete a patient")
    @DeleteMapping("/patients/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id) {
        patientRepository.findById(id).orElseThrow(() -> new RuntimeException("Patient not found"));
        patientRepository.deleteById(id);
        return ResponseEntity.noContent().build();
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
