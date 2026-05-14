package com.auca.diacare.auth.dto;

import com.auca.diacare.auth.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.util.UUID;
// import lombok.Data;

// @Data
public class RegisterRequest {

    // Frontend sends "name" — mapped to username
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    // Optional — defaults to PATIENT. Set to DOCTOR if is_doctor=true
    private Role role;

    // Doctor-specific fields (optional)
    private boolean is_doctor;
    private String license_number;
    private String specialization;
    private String hospital;

    // Patient-specific fields
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private String diabetesType;
    private String gender;
    private Double targetHbA1c;
    private Boolean hasAllergies;
    private String allergyDetails;
    private UUID preferredDoctorPublicId;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public boolean isIs_doctor() { return is_doctor; }
    public void setIs_doctor(boolean is_doctor) { this.is_doctor = is_doctor; }

    public String getLicense_number() { return license_number; }
    public void setLicense_number(String license_number) { this.license_number = license_number; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getHospital() { return hospital; }
    public void setHospital(String hospital) { this.hospital = hospital; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getDiabetesType() { return diabetesType; }
    public void setDiabetesType(String diabetesType) { this.diabetesType = diabetesType; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public Double getTargetHbA1c() { return targetHbA1c; }
    public void setTargetHbA1c(Double targetHbA1c) { this.targetHbA1c = targetHbA1c; }

    public Boolean getHasAllergies() { return hasAllergies; }
    public void setHasAllergies(Boolean hasAllergies) { this.hasAllergies = hasAllergies; }

    public String getAllergyDetails() { return allergyDetails; }
    public void setAllergyDetails(String allergyDetails) { this.allergyDetails = allergyDetails; }

    public UUID getPreferredDoctorPublicId() { return preferredDoctorPublicId; }
    public void setPreferredDoctorPublicId(UUID preferredDoctorPublicId) { this.preferredDoctorPublicId = preferredDoctorPublicId; }
}
