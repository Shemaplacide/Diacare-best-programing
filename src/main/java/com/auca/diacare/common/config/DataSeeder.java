package com.auca.diacare.common.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.auca.diacare.appointment.model.Appointment;
import com.auca.diacare.appointment.repository.AppointmentRepository;
import com.auca.diacare.auth.model.Role;
import com.auca.diacare.auth.model.User;
import com.auca.diacare.auth.repository.UserRepository;
import com.auca.diacare.doctor.model.Doctor;
import com.auca.diacare.doctor.repository.DoctorRepository;
import com.auca.diacare.glucose.model.GlucoseReading;
import com.auca.diacare.glucose.model.GlucoseReading.MealContext;
import com.auca.diacare.glucose.model.GlucoseReading.Unit;
import com.auca.diacare.glucose.repository.GlucoseReadingRepository;
import com.auca.diacare.metrics.model.HealthMetrics;
import com.auca.diacare.metrics.repository.HealthMetricsRepository;
import com.auca.diacare.notification.model.Notification;
import com.auca.diacare.notification.model.Notification.Type;
import com.auca.diacare.notification.repository.NotificationRepository;
import com.auca.diacare.patient.model.Patient;
import com.auca.diacare.patient.repository.PatientRepository;
import com.auca.diacare.prescription.model.Prescription;
import com.auca.diacare.prescription.repository.PrescriptionRepository;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final GlucoseReadingRepository glucoseRepository;
    private final HealthMetricsRepository metricsRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, PatientRepository patientRepository,
            DoctorRepository doctorRepository, AppointmentRepository appointmentRepository,
            PrescriptionRepository prescriptionRepository, GlucoseReadingRepository glucoseRepository,
            HealthMetricsRepository metricsRepository, NotificationRepository notificationRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.glucoseRepository = glucoseRepository;
        this.metricsRepository = metricsRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        System.out.println(">>> Seeding DiaCare database...");

        // ── Users ──────────────────────────────────────────────────────────────
        User adminUser   = userRepository.save(new User("admin",         "admin@diacare.com",  passwordEncoder.encode("Admin@123"),   Role.ADMIN));
        User doctorUser  = userRepository.save(new User("dr.mugisha",    "mugisha@diacare.com", passwordEncoder.encode("Doctor@123"), Role.DOCTOR));
        User doctorUser2 = userRepository.save(new User("dr.uwimana",    "uwimana@diacare.com", passwordEncoder.encode("Doctor@123"), Role.DOCTOR));
        User patientUser = userRepository.save(new User("jean.baptiste", "jean@diacare.com",    passwordEncoder.encode("Patient@123"), Role.PATIENT));
        User patientUser2= userRepository.save(new User("alice.mutoni",  "alice@diacare.com",   passwordEncoder.encode("Patient@123"), Role.PATIENT));

        // ── Doctor Profiles ────────────────────────────────────────────────────
        Doctor doctor1 = new Doctor();
        doctor1.setUser(doctorUser);
        doctor1.setSpecialization("Endocrinology");
        doctor1.setLicenseNumber("RW-MED-001");
        doctor1.setYearsOfExperience(10);
        doctorRepository.save(doctor1);

        Doctor doctor2 = new Doctor();
        doctor2.setUser(doctorUser2);
        doctor2.setSpecialization("Internal Medicine");
        doctor2.setLicenseNumber("RW-MED-002");
        doctor2.setYearsOfExperience(7);
        doctorRepository.save(doctor2);

        // ── Patient Profiles ───────────────────────────────────────────────────
        Patient patient1 = new Patient();
        patient1.setUser(patientUser);
        patient1.setDiabetesType("TYPE_2");
        patient1.setDateOfBirth(LocalDate.of(1985, 3, 12));
        patient1.setGender("MALE");
        patient1.setTargetHbA1c(7.0);
        patientRepository.save(patient1);

        Patient patient2 = new Patient();
        patient2.setUser(patientUser2);
        patient2.setDiabetesType("TYPE_1");
        patient2.setDateOfBirth(LocalDate.of(1995, 7, 22));
        patient2.setGender("FEMALE");
        patient2.setTargetHbA1c(6.5);
        patientRepository.save(patient2);

        // ── Prescriptions ──────────────────────────────────────────────────────
        Prescription rx1 = new Prescription();
        rx1.setPatient(patient1); rx1.setDoctor(doctor1);
        rx1.setMedication("Metformin"); rx1.setDosage("500mg twice daily");
        rx1.setInstructions("Take with meals. Monitor blood sugar daily.");
        rx1.setStartDate(LocalDate.now().minusDays(30)); rx1.setEndDate(LocalDate.now().plusDays(60));
        prescriptionRepository.save(rx1);

        Prescription rx2 = new Prescription();
        rx2.setPatient(patient1); rx2.setDoctor(doctor1);
        rx2.setMedication("Glibenclamide"); rx2.setDosage("5mg once daily before breakfast");
        rx2.setInstructions("Do not skip meals while on this medication.");
        rx2.setStartDate(LocalDate.now().minusDays(30)); rx2.setEndDate(LocalDate.now().plusDays(60));
        prescriptionRepository.save(rx2);

        Prescription rx3 = new Prescription();
        rx3.setPatient(patient2); rx3.setDoctor(doctor2);
        rx3.setMedication("Insulin Glargine"); rx3.setDosage("10 units subcutaneous at bedtime");
        rx3.setInstructions("Rotate injection sites. Store insulin in refrigerator.");
        rx3.setStartDate(LocalDate.now().minusDays(30));
        prescriptionRepository.save(rx3);

        Prescription rx4 = new Prescription();
        rx4.setPatient(patient2); rx4.setDoctor(doctor2);
        rx4.setMedication("Aspirin"); rx4.setDosage("75mg once daily");
        rx4.setInstructions("Take after food. Cardiovascular protection.");
        rx4.setStartDate(LocalDate.now().minusDays(15)); rx4.setEndDate(LocalDate.now().plusDays(90));
        prescriptionRepository.save(rx4);

        // ── Appointments: today → 20th of current month ────────────────────────
        LocalDate today = LocalDate.now();
        LocalDate target = today.withDayOfMonth(20);
        // If today is past the 20th, target next month's 20th
        if (today.getDayOfMonth() > 20) target = target.plusMonths(1);

        // Past appointments (last 30 days) — completed
        String[][] pastApts = {
            {"Quarterly HbA1c review",         "-28"},
            {"Blood pressure follow-up",        "-21"},
            {"Medication adjustment",           "-14"},
            {"Routine check-up",                "-10"},
            {"Glucose trend review",            "-7"},
            {"Initial consultation",            "-5"},
            {"Insulin dosage review",           "-3"},
            {"Pre-appointment blood work",      "-1"},
        };
        for (String[] a : pastApts) {
            Appointment apt = new Appointment();
            apt.setPatient(Integer.parseInt(a[1]) % 2 == 0 ? patient1 : patient2);
            apt.setDoctor(Integer.parseInt(a[1]) % 3 == 0 ? doctor2 : doctor1);
            apt.setAppointmentDate(LocalDateTime.of(today.plusDays(Long.parseLong(a[1])), LocalTime.of(9, 0)));
            apt.setStatus(Appointment.Status.COMPLETED);
            apt.setNotes(a[0]);
            appointmentRepository.save(apt);
        }

        // Upcoming appointments: today through the 20th
        int daysUntil20 = (int) java.time.temporal.ChronoUnit.DAYS.between(today, target);
        String[] upcomingNotes = {
            "HbA1c quarterly review",
            "Insulin dosage adjustment",
            "Dietary counselling session",
            "Blood pressure monitoring",
            "Foot examination",
            "Eye screening referral",
            "Kidney function follow-up",
            "Cholesterol review",
            "Medication compliance check",
            "Glucose trend analysis",
            "Weight management review",
            "Neuropathy screening",
            "Retinopathy follow-up",
            "Cardiology referral review",
            "General diabetes review",
            "Lab results discussion",
            "Lifestyle modification plan",
            "Emergency glucose spike review",
            "Annual comprehensive review",
            "Pre-travel health check",
        };
        Appointment.Status[] upcomingStatuses = {
            Appointment.Status.CONFIRMED, Appointment.Status.PENDING, Appointment.Status.CONFIRMED,
            Appointment.Status.PENDING,   Appointment.Status.CONFIRMED, Appointment.Status.PENDING,
            Appointment.Status.CONFIRMED, Appointment.Status.PENDING,   Appointment.Status.CONFIRMED,
            Appointment.Status.PENDING,   Appointment.Status.CONFIRMED, Appointment.Status.PENDING,
            Appointment.Status.CONFIRMED, Appointment.Status.PENDING,   Appointment.Status.CONFIRMED,
            Appointment.Status.PENDING,   Appointment.Status.CONFIRMED, Appointment.Status.PENDING,
            Appointment.Status.CONFIRMED, Appointment.Status.PENDING,
        };
        int[] aptHours = {8, 9, 10, 11, 14, 15, 16, 8, 9, 10, 11, 14, 15, 16, 8, 9, 10, 11, 14, 15};

        for (int d = 0; d <= daysUntil20 && d < upcomingNotes.length; d++) {
            Appointment apt = new Appointment();
            apt.setPatient(d % 2 == 0 ? patient1 : patient2);
            apt.setDoctor(d % 3 == 0 ? doctor2 : doctor1);
            apt.setAppointmentDate(LocalDateTime.of(today.plusDays(d), LocalTime.of(aptHours[d % aptHours.length], 0)));
            apt.setStatus(upcomingStatuses[d]);
            apt.setNotes(upcomingNotes[d]);
            appointmentRepository.save(apt);
        }

        // ── Glucose Readings — patient1: 30 days × 3 readings/day ─────────────
        // Simulates a gradual improvement trend (high → controlled)
        double[] p1Morning  = {10.2,9.8,9.5,9.1,8.9,8.7,8.4,8.2,8.0,7.9,7.7,7.5,7.4,7.2,7.1,7.0,6.9,6.8,6.7,6.6,6.5,6.4,6.5,6.3,6.4,6.2,6.3,6.1,6.2,6.0};
        double[] p1Midday   = {12.1,11.8,11.5,11.0,10.8,10.5,10.2,9.9,9.7,9.4,9.2,9.0,8.8,8.6,8.4,8.2,8.0,7.9,7.7,7.6,7.5,7.4,7.3,7.2,7.1,7.0,6.9,6.8,6.7,6.6};
        double[] p1Evening  = {9.1,8.8,8.6,8.3,8.1,7.9,7.7,7.5,7.4,7.2,7.1,7.0,6.9,6.8,6.7,6.6,6.5,6.4,6.3,6.2,6.1,6.0,6.1,5.9,6.0,5.8,5.9,5.7,5.8,5.6};
        MealContext[] p1Ctx = {MealContext.FASTING, MealContext.AFTER_MEAL, MealContext.BEDTIME};

        for (int day = 0; day < 30; day++) {
            double[] vals = {p1Morning[day], p1Midday[day], p1Evening[day]};
            int[] hours = {7, 13, 20};
            for (int t = 0; t < 3; t++) {
                GlucoseReading gr = new GlucoseReading();
                gr.setPatient(patient1);
                gr.setValue(vals[t]);
                gr.setUnit(Unit.MMOL_L);
                gr.setMealContext(p1Ctx[t]);
                gr.setRecordedAt(LocalDateTime.of(today.minusDays(29 - day), LocalTime.of(hours[t], 0)));
                glucoseRepository.save(gr);
            }
        }

        // ── Glucose Readings — patient2: 30 days × 3 readings/day ─────────────
        // TYPE_1 — more variable, slight upward drift then stabilise
        double[] p2Morning = {5.2,5.5,4.9,6.1,5.8,5.3,6.4,5.7,5.1,6.2,5.9,5.4,6.5,5.8,5.2,6.3,5.6,5.0,6.1,5.7,5.3,6.0,5.5,5.1,5.9,5.4,5.0,5.8,5.3,5.1};
        double[] p2Midday  = {8.1,7.8,8.4,7.5,8.2,7.9,8.6,7.3,8.0,7.7,8.3,7.4,8.1,7.8,8.5,7.2,7.9,8.2,7.6,8.0,7.7,8.3,7.5,7.9,8.1,7.6,8.0,7.8,8.2,7.7};
        double[] p2Evening = {6.8,7.1,6.5,7.3,6.9,7.2,6.6,7.4,6.8,7.0,6.7,7.3,6.5,7.1,6.9,7.2,6.6,7.0,6.8,7.3,6.7,7.1,6.9,7.2,6.5,7.0,6.8,7.1,6.6,7.0};
        MealContext[] p2Ctx = {MealContext.FASTING, MealContext.AFTER_MEAL, MealContext.BEFORE_MEAL};

        for (int day = 0; day < 30; day++) {
            double[] vals = {p2Morning[day], p2Midday[day], p2Evening[day]};
            int[] hours = {6, 12, 19};
            for (int t = 0; t < 3; t++) {
                GlucoseReading gr = new GlucoseReading();
                gr.setPatient(patient2);
                gr.setValue(vals[t]);
                gr.setUnit(Unit.MMOL_L);
                gr.setMealContext(p2Ctx[t]);
                gr.setRecordedAt(LocalDateTime.of(today.minusDays(29 - day), LocalTime.of(hours[t], 0)));
                glucoseRepository.save(gr);
            }
        }

        // ── Health Metrics — patient1: every 5 days for 30 days ───────────────
        double[][] p1Metrics = {
            // weight, height, hba1c, systolic, diastolic, cholesterol
            {91.0, 175.0, 8.9, 145, 92, 5.8},
            {90.5, 175.0, 8.7, 142, 90, 5.7},
            {90.0, 175.0, 8.4, 140, 89, 5.6},
            {89.5, 175.0, 8.2, 138, 88, 5.5},
            {89.0, 175.0, 8.0, 136, 87, 5.4},
            {88.5, 175.0, 7.8, 134, 86, 5.3},
        };
        for (int i = 0; i < p1Metrics.length; i++) {
            HealthMetrics m = new HealthMetrics();
            m.setPatient(patient1);
            m.setWeight(p1Metrics[i][0]);
            m.setHeight(p1Metrics[i][1]);
            m.setHba1c(p1Metrics[i][2]);
            m.setBloodPressureSystolic((int) p1Metrics[i][3]);
            m.setBloodPressureDiastolic((int) p1Metrics[i][4]);
            m.setCholesterol(p1Metrics[i][5]);
            m.setRecordedAt(LocalDateTime.of(today.minusDays(25 - (i * 5)), LocalTime.NOON));
            metricsRepository.save(m);
        }

        // ── Health Metrics — patient2: every 5 days for 30 days ───────────────
        double[][] p2Metrics = {
            {63.0, 165.0, 7.8, 122, 80, 4.5},
            {62.8, 165.0, 7.6, 120, 79, 4.4},
            {62.5, 165.0, 7.4, 119, 78, 4.3},
            {62.3, 165.0, 7.2, 118, 77, 4.2},
            {62.0, 165.0, 7.0, 117, 76, 4.1},
            {61.8, 165.0, 6.8, 116, 75, 4.0},
        };
        for (int i = 0; i < p2Metrics.length; i++) {
            HealthMetrics m = new HealthMetrics();
            m.setPatient(patient2);
            m.setWeight(p2Metrics[i][0]);
            m.setHeight(p2Metrics[i][1]);
            m.setHba1c(p2Metrics[i][2]);
            m.setBloodPressureSystolic((int) p2Metrics[i][3]);
            m.setBloodPressureDiastolic((int) p2Metrics[i][4]);
            m.setCholesterol(p2Metrics[i][5]);
            m.setRecordedAt(LocalDateTime.of(today.minusDays(25 - (i * 5)), LocalTime.NOON));
            metricsRepository.save(m);
        }

        // ── Notifications ──────────────────────────────────────────────────────
        String[][] notifs = {
            {"APPOINTMENT_REMINDER", "jean",  "Reminder: You have an appointment with Dr. Mugisha tomorrow at 9:00 AM."},
            {"PRESCRIPTION_ISSUED",  "jean",  "Dr. Mugisha has issued a new prescription: Metformin 500mg."},
            {"GENERAL",              "jean",  "High glucose alert: Your reading of 10.2 mmol/L is above your target range."},
            {"GENERAL",              "jean",  "Your HbA1c has improved from 8.9% to 7.8% over the last 30 days. Great progress!"},
            {"APPOINTMENT_REMINDER", "alice", "Reminder: You have an appointment with Dr. Uwimana in 2 days."},
            {"PRESCRIPTION_ISSUED",  "alice", "Dr. Uwimana has updated your Insulin Glargine dosage."},
            {"GENERAL",              "alice", "Your HbA1c result is available. Please review with your doctor."},
            {"GENERAL",              "alice", "Low glucose alert: Your fasting reading of 4.9 mmol/L is below target."},
        };
        User[] notifUsers = {patientUser, patientUser, patientUser, patientUser,
                             patientUser2, patientUser2, patientUser2, patientUser2};
        for (int i = 0; i < notifs.length; i++) {
            Notification n = new Notification();
            n.setRecipient(notifUsers[i]);
            n.setType(Type.valueOf(notifs[i][0]));
            n.setMessage(notifs[i][2]);
            notificationRepository.save(n);
        }

        System.out.println(">>> Seeding complete.");
        System.out.println(">>> Swagger UI: http://localhost:8085/swagger-ui.html");
        System.out.println(">>> Test credentials:");
        System.out.println("    Admin:   admin@diacare.com   / Admin@123");
        System.out.println("    Doctor:  mugisha@diacare.com / Doctor@123");
        System.out.println("    Patient: jean@diacare.com    / Patient@123");
        System.out.println("    Patient: alice@diacare.com   / Patient@123");
    }
}
