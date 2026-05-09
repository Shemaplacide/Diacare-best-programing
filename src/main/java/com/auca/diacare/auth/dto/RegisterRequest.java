package com.auca.diacare.auth.dto;

import com.auca.diacare.auth.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
}
