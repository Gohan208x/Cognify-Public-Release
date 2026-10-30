package com.cognify.service;

import com.cognify.entity.User;
import com.cognify.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    // The permanent owner who cannot be banned or have admin revoked
    private static final String OWNER_USERNAME = "ShivamTanwar";

    @Autowired
    private UserRepository userRepository;

    /**
     * Check if user is the permanent owner
     */
    public boolean isOwner(String username) {
        return OWNER_USERNAME.equalsIgnoreCase(username);
    }

    /**
     * Check if user has admin privileges
     */
    public boolean isAdmin(String username) {
        Optional<User> user = userRepository.findByUsername(username);
        return user.map(u -> u.getIsAdmin() || isOwner(username)).orElse(false);
    }

    /**
     * Get all users
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Get user by username
     */
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Get all admins
     */
    public List<User> getAllAdmins() {
        return userRepository.findAll().stream()
                .filter(u -> u.getIsAdmin() || isOwner(u.getUsername()))
                .toList();
    }

    /**
     * Update user data (coins, xp, level, streak)
     */
    public User updateUserData(String username, Integer coins, Integer xp, Integer level, Integer streak) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        if (coins != null)
            user.setCoins(coins);
        if (xp != null)
            user.setXp(xp);
        if (level != null)
            user.setLevel(level);
        if (streak != null)
            user.setStreak(streak);

        return userRepository.save(user);
    }

    /**
     * Add badges to user (comma-separated badge IDs)
     */
    public User addBadges(String username, String badges) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        String current = user.getBadges() != null ? user.getBadges() : "";
        if (!current.isEmpty() && !badges.isEmpty()) {
            current += "," + badges;
        } else if (!badges.isEmpty()) {
            current = badges;
        }
        user.setBadges(current);

        return userRepository.save(user);
    }

    /**
     * Remove badges from user
     */
    public User removeBadges(String username, String badgesToRemove) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        String current = user.getBadges() != null ? user.getBadges() : "";
        if (!current.isEmpty()) {
            String[] toRemove = badgesToRemove.split(",");
            for (String badge : toRemove) {
                current = current.replaceAll("(^|,)" + badge.trim() + "(,|$)", "$1").replaceAll("^,|,$", "")
                        .replaceAll(",,", ",");
            }
            user.setBadges(current);
        }

        return userRepository.save(user);
    }

    /**
     * Set admin status for a user
     */
    public User setAdminStatus(String username, boolean isAdmin, String requestingAdmin) {
        // Protect the owner - cannot remove owner's admin status
        if (isOwner(username) && !isAdmin) {
            throw new RuntimeException("Cannot remove admin privileges from owner");
        }

        // Only owner can manage other admins
        if (!isOwner(requestingAdmin)) {
            throw new RuntimeException("Only the owner can manage admin privileges");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        user.setIsAdmin(isAdmin);
        return userRepository.save(user);
    }

    /**
     * Ban a user (temporary or permanent)
     * 
     * @param days - number of days to ban (null or 0 = permanent)
     */
    public User banUser(String username, Integer days, String reason, String requestingAdmin) {
        // Protect the owner - cannot ban owner
        if (isOwner(username)) {
            throw new RuntimeException("Cannot ban the owner");
        }

        // Cannot ban other admins unless you're the owner
        User targetUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        if (targetUser.getIsAdmin() && !isOwner(requestingAdmin)) {
            throw new RuntimeException("Only the owner can ban other admins");
        }

        targetUser.setIsBanned(true);
        targetUser.setBanReason(reason != null ? reason : "No reason provided");

        if (days != null && days > 0) {
            targetUser.setBanExpiry(LocalDateTime.now().plusDays(days));
        } else {
            targetUser.setBanExpiry(null); // Permanent ban
        }

        return userRepository.save(targetUser);
    }

    /**
     * Unban a user
     */
    public User unbanUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        user.setIsBanned(false);
        user.setBanExpiry(null);
        user.setBanReason(null);

        return userRepository.save(user);
    }

    /**
     * Check if ban has expired and auto-unban if so
     * Returns true if user is still banned, false if unbanned or was never banned
     */
    public boolean checkAndUpdateBanStatus(User user) {
        if (!user.getIsBanned()) {
            return false;
        }

        // Check if ban has expired
        if (user.getBanExpiry() != null && user.getBanExpiry().isBefore(LocalDateTime.now())) {
            user.setIsBanned(false);
            user.setBanExpiry(null);
            user.setBanReason(null);
            userRepository.save(user);
            return false;
        }

        return true; // Still banned
    }

    /**
     * Ensure owner always has admin status
     */
    public void ensureOwnerIsAdmin() {
        userRepository.findByUsername(OWNER_USERNAME).ifPresent(owner -> {
            if (!owner.getIsAdmin()) {
                owner.setIsAdmin(true);
                userRepository.save(owner);
            }
        });
    }
}
