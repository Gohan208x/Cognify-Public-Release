package com.cognify.controller;

import com.cognify.entity.User;
import com.cognify.service.AdminService;
import com.cognify.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private JwtService jwtService;

    /**
     * Check if current user is admin (for frontend access control)
     */
    @GetMapping("/check")
    public ResponseEntity<?> checkAdmin(@RequestHeader("Authorization") String authHeader) {
        String username = extractUsername(authHeader);
        boolean isAdmin = adminService.isAdmin(username);
        boolean isOwner = adminService.isOwner(username);

        Map<String, Object> response = new HashMap<>();
        response.put("isAdmin", isAdmin);
        response.put("isOwner", isOwner);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all users
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestHeader("Authorization") String authHeader) {
        requireAdmin(authHeader);
        List<User> users = adminService.getAllUsers();
        return ResponseEntity.ok(users.stream().map(this::mapUserToDto).toList());
    }

    /**
     * Get user by username
     */
    @GetMapping("/users/{username}")
    public ResponseEntity<?> getUserByUsername(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String username) {
        requireAdmin(authHeader);
        return adminService.getUserByUsername(username)
                .map(u -> ResponseEntity.ok(mapUserToDto(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all admins
     */
    @GetMapping("/admins")
    public ResponseEntity<?> getAllAdmins(@RequestHeader("Authorization") String authHeader) {
        requireAdmin(authHeader);
        List<User> admins = adminService.getAllAdmins();
        return ResponseEntity.ok(admins.stream().map(u -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", u.getId());
            dto.put("username", u.getUsername());
            dto.put("isOwner", adminService.isOwner(u.getUsername()));
            dto.put("level", u.getLevel());
            return dto;
        }).toList());
    }

    /**
     * Update user data
     */
    @PutMapping("/users/{username}/data")
    public ResponseEntity<?> updateUserData(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String username,
            @RequestBody Map<String, Integer> data) {
        requireAdmin(authHeader);

        Integer coins = data.get("coins");
        Integer xp = data.get("xp");
        Integer level = data.get("level");
        Integer streak = data.get("streak");

        User updated = adminService.updateUserData(username, coins, xp, level, streak);
        return ResponseEntity.ok(mapUserToDto(updated));
    }

    /**
     * Add badges to user
     */
    @PostMapping("/users/{username}/badges/add")
    public ResponseEntity<?> addBadges(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String username,
            @RequestBody Map<String, String> data) {
        requireAdmin(authHeader);
        String badges = data.get("badges");
        User updated = adminService.addBadges(username, badges);
        return ResponseEntity.ok(mapUserToDto(updated));
    }

    /**
     * Remove badges from user
     */
    @PostMapping("/users/{username}/badges/remove")
    public ResponseEntity<?> removeBadges(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String username,
            @RequestBody Map<String, String> data) {
        requireAdmin(authHeader);
        String badges = data.get("badges");
        User updated = adminService.removeBadges(username, badges);
        return ResponseEntity.ok(mapUserToDto(updated));
    }

    /**
     * Set admin status
     */
    @PutMapping("/users/{username}/admin")
    public ResponseEntity<?> setAdminStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String username,
            @RequestBody Map<String, Boolean> data) {
        String requestingAdmin = extractUsername(authHeader);

        // Only owner can manage admins
        if (!adminService.isOwner(requestingAdmin)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only the owner can manage admin privileges"));
        }

        Boolean isAdmin = data.get("isAdmin");
        if (isAdmin == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "isAdmin field required"));
        }

        User updated = adminService.setAdminStatus(username, isAdmin, requestingAdmin);
        return ResponseEntity.ok(mapUserToDto(updated));
    }

    /**
     * Ban a user
     */
    @PostMapping("/users/{username}/ban")
    public ResponseEntity<?> banUser(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String username,
            @RequestBody Map<String, Object> data) {
        String requestingAdmin = extractUsername(authHeader);
        requireAdmin(authHeader);

        Integer days = data.get("days") != null ? ((Number) data.get("days")).intValue() : null;
        String reason = (String) data.get("reason");

        try {
            User updated = adminService.banUser(username, days, reason, requestingAdmin);
            return ResponseEntity.ok(mapUserToDto(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Unban a user
     */
    @PostMapping("/users/{username}/unban")
    public ResponseEntity<?> unbanUser(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String username) {
        requireAdmin(authHeader);
        User updated = adminService.unbanUser(username);
        return ResponseEntity.ok(mapUserToDto(updated));
    }

    // ============== Helper Methods ==============

    private String extractUsername(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtService.extractUsername(token);
        }
        throw new RuntimeException("Invalid authorization header");
    }

    private void requireAdmin(String authHeader) {
        String username = extractUsername(authHeader);
        if (!adminService.isAdmin(username)) {
            throw new RuntimeException("Admin access required");
        }
    }

    private Map<String, Object> mapUserToDto(User user) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", user.getId());
        dto.put("username", user.getUsername());
        dto.put("coins", user.getCoins());
        dto.put("xp", user.getXp());
        dto.put("level", user.getLevel());
        dto.put("streak", user.getStreak());
        dto.put("badges", user.getBadges());
        dto.put("isAdmin", user.getIsAdmin() || adminService.isOwner(user.getUsername()));
        dto.put("isOwner", adminService.isOwner(user.getUsername()));
        dto.put("isBanned", user.getIsBanned());
        dto.put("banExpiry", user.getBanExpiry() != null ? user.getBanExpiry().toString() : null);
        dto.put("banReason", user.getBanReason());
        dto.put("totalStudyMinutes", user.getTotalStudyMinutes());
        dto.put("profileBorder", user.getProfileBorder());
        dto.put("profileBanner", user.getProfileBanner());
        return dto;
    }
}
