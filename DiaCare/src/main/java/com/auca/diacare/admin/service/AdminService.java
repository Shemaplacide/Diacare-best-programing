package com.auca.diacare.admin.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Map;

import com.auca.diacare.admin.model.Admin;
import com.auca.diacare.auth.model.User;

public interface AdminService {
    Admin registerAdmin(Admin admin);

    Optional<Admin> getAdminByPublicId(UUID publicId);

    Admin updateAdmin(UUID publicId, Admin adminDetails);

    void deleteAdmin(UUID publicId);

    // user management — admin-only operations
    List<User> getAllUsers();

    void deactivateUser(UUID userPublicId);

    void activateUser(UUID userPublicId);

    // dashboard stats
    Map<String, Object> getDashboardStats();
}
