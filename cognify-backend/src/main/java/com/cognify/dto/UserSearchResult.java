package com.cognify.dto;

import com.cognify.entity.User;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class UserSearchResult {
    private Long id;
    private String username;
    private String displayName;
    private String avatar;
    private String profilePictureUrl; // Custom image URL
    private String title;
    private Integer level;
    private String college;
    private String profileBorder;
    private String profileTheme;
    private String connectionStatus; // NONE, PENDING_SENT, PENDING_RECEIVED, CONNECTED
    private List<String> skills; // User's skills for skill search feature

    public UserSearchResult() {
    }

    public static UserSearchResult fromEntity(User user, String connectionStatus) {
        UserSearchResult dto = new UserSearchResult();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setDisplayName(user.getDisplayName());
        dto.setAvatar(user.getAvatar());
        dto.setProfilePictureUrl(user.getProfilePictureUrl());
        dto.setTitle(user.getTitle());
        dto.setLevel(user.getLevel());
        dto.setCollege(user.getCollege());
        dto.setProfileBorder(user.getProfileBorder());
        dto.setProfileTheme(user.getProfileTheme());
        dto.setConnectionStatus(connectionStatus);
        // Parse skills from comma-separated string
        String skillsStr = user.getSkills();
        if (skillsStr != null && !skillsStr.trim().isEmpty()) {
            dto.setSkills(Arrays.stream(skillsStr.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList()));
        } else {
            dto.setSkills(Collections.emptyList());
        }
        return dto;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public String getCollege() {
        return college;
    }

    public void setCollege(String college) {
        this.college = college;
    }

    public String getConnectionStatus() {
        return connectionStatus;
    }

    public void setConnectionStatus(String connectionStatus) {
        this.connectionStatus = connectionStatus;
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

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }
}
