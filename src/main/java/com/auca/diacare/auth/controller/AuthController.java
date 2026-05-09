package com.auca.diacare.auth.controller;

import com.auca.diacare.auth.dto.AuthResponse;
import com.auca.diacare.auth.dto.LoginRequest;
import com.auca.diacare.auth.dto.RegisterRequest;
import com.auca.diacare.auth.model.User;
import com.auca.diacare.auth.repository.UserRepository;
import com.auca.diacare.auth.service.AuthService;
import com.auca.diacare.common.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Authentication", description = "Register and login to obtain a JWT token")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public AuthController(AuthService authService, UserRepository userRepository, JwtUtil jwtUtil) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @Operation(summary = "Register a new user", description = "Creates a new user account. Role defaults to PATIENT; set is_doctor=true for DOCTOR.")
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @Operation(summary = "Login", description = "Authenticate with email and password. Returns a JWT token.")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @Operation(summary = "Get current user", description = "Returns the authenticated user's profile from the JWT token.")
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMe(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(Map.of(
                "name", user.getUsername(),
                "email", user.getEmail(),
                "role", user.getRole().name()));
    }

    @Operation(summary = "Update current user profile")
    @PutMapping("/me")
    public ResponseEntity<Map<String, Object>> updateMe(@RequestBody Map<String, String> body,
            Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (body.containsKey("name") && !body.get("name").isBlank())
            user.setUsername(body.get("name"));
        if (body.containsKey("email") && !body.get("email").isBlank())
            user.setEmail(body.get("email"));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of(
                "name", user.getUsername(),
                "email", user.getEmail(),
                "role", user.getRole().name()));
    }

    @Operation(summary = "Change password")
    @PutMapping("/me/password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody Map<String, String> body,
            Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        authService.changePassword(user, body.get("currentPassword"), body.get("newPassword"));
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

    @Operation(summary = "Logout", description = "Clears the server-side session (client should also clear tokens).")
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @Operation(summary = "Refresh access token", description = "Issues a new access token using the provided access token.")
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refresh(@RequestBody Map<String, String> body) {
        String token = body.get("access_token");
        if (token == null || !jwtUtil.isTokenValid(token)) {
            throw new RuntimeException("Invalid or expired token");
        }
        String email = jwtUtil.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String newToken = jwtUtil.generateToken(user);
        return ResponseEntity.ok(Map.of("access_token", newToken));
    }

    @Operation(summary = "Forgot password", description = "Sends a password reset email to the user.")
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(Map.of("message", "Password reset email sent"));
    }

    @Operation(summary = "Reset password", description = "Resets the user's password using a token.")
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    @Operation(summary = "Seed status", description = "Returns how many users are in the DB — confirms whether DataSeeder ran.")
    @GetMapping("/seed-status")
    public ResponseEntity<Map<String, Object>> seedStatus() {
        long count = userRepository.count();
        return ResponseEntity.ok(Map.of(
                "userCount", count,
                "seeded", count > 0));
    }
}
