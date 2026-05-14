package com.auca.diacare.common.config;

import com.auca.diacare.admin.model.Admin;
import com.auca.diacare.admin.repository.AdminRepository;
import com.auca.diacare.auth.model.Role;
import com.auca.diacare.auth.model.User;
import com.auca.diacare.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrap implements CommandLineRunner {
    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap-admin.enabled:false}")
    private boolean enabled;

    @Value("${app.bootstrap-admin.username:admin}")
    private String username;

    @Value("${app.bootstrap-admin.email:admin@diacare.com}")
    private String email;

    @Value("${app.bootstrap-admin.password:Admin@123}")
    private String password;

    public AdminBootstrap(UserRepository userRepository, AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!enabled) return;

        User admin = userRepository.findByEmail(email)
                .or(() -> userRepository.findByUsername(username))
                .orElseGet(User::new);

        admin.setUsername(username);
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setRole(Role.ADMIN);
        admin.setActive(true);
        User saved = userRepository.save(admin);

        adminRepository.findByUserEmail(saved.getEmail()).orElseGet(() -> {
            Admin profile = new Admin();
            profile.setUser(saved);
            profile.setDepartment("Administration");
            return adminRepository.save(profile);
        });
    }
}
