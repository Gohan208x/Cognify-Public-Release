package com.cognify.controller;

import com.cognify.dto.*;
import com.cognify.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = userService.register(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Registration failed", e);
            // Return the error message directly to the client for debugging
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = userService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Login failed", e);
            return ResponseEntity.status(401).body(java.util.Map.of("error", "Invalid credentials"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(java.security.Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        var user = userService.getCurrentUser(principal.getName());
        return ResponseEntity.ok(UserResponse.fromEntity(user));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(java.security.Principal principal,
            @RequestBody java.util.Map<String, String> request) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");

        if (oldPassword == null || newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", "Invalid password. New password must be at least 6 characters."));
        }

        try {
            userService.changePassword(principal.getName(), oldPassword, newPassword);
            return ResponseEntity.ok(java.util.Map.of("message", "Password changed successfully"));
        } catch (RuntimeException e) {
            log.error("Password change failed", e);
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/security-question/{username}")
    public ResponseEntity<?> getSecurityQuestion(@PathVariable String username) {
        try {
            String question = userService.getSecurityQuestion(username);
            return ResponseEntity.ok(java.util.Map.of("securityQuestion", question));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody java.util.Map<String, String> request) {
        String username = request.get("username");
        String securityAnswer = request.get("securityAnswer");
        String newPassword = request.get("newPassword");

        if (username == null || securityAnswer == null || newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(
                    java.util.Map.of("error", "All fields are required. Password must be at least 6 characters."));
        }

        try {
            userService.resetPasswordWithSecurityQuestion(username, securityAnswer, newPassword);
            return ResponseEntity.ok(java.util.Map.of("message", "Password reset successfully. You can now login."));
        } catch (RuntimeException e) {
            log.error("Password reset failed for user: {}", username);
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}
