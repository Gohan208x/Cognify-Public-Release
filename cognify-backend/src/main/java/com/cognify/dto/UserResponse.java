package com.cognify.dto;

import com.cognify.entity.User;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

public class UserResponse {
    private Long id;
    private String name;
    private String displayName;
    private boolean isLoggedIn;
    private int xp;
    private int level;
    private int streak;
    private String lastLogin;
    private int coins;
    private String avatar;
    private String profilePictureUrl; // Custom avatar URL
    private String title;
    private List<String> unlockedItems;
    private Map<String, Long> activeTrials;
    private String profileBorder;
    private String profileTheme;
    private String profileBanner;
    private String profileBackground;
    private boolean isAdmin;

    public UserResponse() {
    }

    public UserResponse(Long id, String name, boolean isLoggedIn, int xp, int level, int streak, String lastLogin,
            int coins, String avatar, String title, List<String> unlockedItems, Map<String, Long> activeTrials) {
        this.id = id;
        this.name = name;
        this.isLoggedIn = isLoggedIn;
        this.xp = xp;
        this.level = level;
        this.streak = streak;
        this.lastLogin = lastLogin;
        this.coins = coins;
        this.avatar = avatar;
        this.title = title;
        this.unlockedItems = unlockedItems;
        this.activeTrials = activeTrials;
    }

    public static UserResponse fromEntity(User user) {
        UserResponse response = new UserResponse(
                user.getId(),
                user.getUsername(),
                true,
                user.getXp(),
                user.getLevel(),
                user.getStreak(),
                user.getLastLogin() != null ? user.getLastLogin().toString() : null,
                user.getCoins(),
                user.getAvatar(),
                user.getTitle(),
                user.getUnlockedItemsList(),
                user.getActiveTrialsMap());
        response.setProfilePictureUrl(user.getProfilePictureUrl());
        response.setProfileBorder(user.getProfileBorder());
        response.setProfileTheme(user.getProfileTheme());
        response.setProfileBanner(user.getProfileBanner());
        response.setProfileBackground(user.getProfileBackground());
        response.setDisplayName(user.getDisplayName());
        response.setAdmin(Boolean.TRUE.equals(user.getIsAdmin()));
        return response;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public boolean isLoggedIn() {
        return isLoggedIn;
    }

    public void setLoggedIn(boolean loggedIn) {
        isLoggedIn = loggedIn;
    }

    public int getXp() {
        return xp;
    }

    public void setXp(int xp) {
        this.xp = xp;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public int getStreak() {
        return streak;
    }

    public void setStreak(int streak) {
        this.streak = streak;
    }

    public String getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(String lastLogin) {
        this.lastLogin = lastLogin;
    }

    public int getCoins() {
        return coins;
    }

    public void setCoins(int coins) {
        this.coins = coins;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<String> getUnlockedItems() {
        return unlockedItems;
    }

    public void setUnlockedItems(List<String> unlockedItems) {
        this.unlockedItems = unlockedItems;
    }

    public Map<String, Long> getActiveTrials() {
        return activeTrials;
    }

    public void setActiveTrials(Map<String, Long> activeTrials) {
        this.activeTrials = activeTrials;
    }

    public String getProfileBorder() {
        return profileBorder;
    }

    public void setProfileBorder(String profileBorder) {
        this.profileBorder = profileBorder;
    }

    public String getProfileTheme() {
        return profileTheme;
    }

    public void setProfileTheme(String profileTheme) {
        this.profileTheme = profileTheme;
    }

    public String getProfileBanner() {
        return profileBanner;
    }

    public void setProfileBanner(String profileBanner) {
        this.profileBanner = profileBanner;
    }

    public String getProfileBackground() {
        return profileBackground;
    }

    public void setProfileBackground(String profileBackground) {
        this.profileBackground = profileBackground;
    }

    @JsonProperty("isAdmin")
    public boolean isAdmin() {
        return isAdmin;
    }

    public void setAdmin(boolean isAdmin) {
        this.isAdmin = isAdmin;
    }
}
