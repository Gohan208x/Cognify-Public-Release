package com.cognify.dto;

import com.cognify.entity.Connection;
import java.time.LocalDateTime;

public class ConnectionDto {
    private Long id;
    private Long userId;
    private String username;
    private String displayName;
    private String avatar;
    private String profilePictureUrl; // Custom image URL
    private String title;
    private String profileBorder;
    private String profileTheme;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime acceptedAt;
    private Boolean isRequester;

    public ConnectionDto() {
    }

    public static ConnectionDto fromEntity(Connection connection, Long currentUserId) {
        ConnectionDto dto = new ConnectionDto();
        dto.setId(connection.getId());

        // Determine the "other" user in the connection
        boolean isRequester = connection.getRequester().getId().equals(currentUserId);
        var otherUser = isRequester ? connection.getRecipient() : connection.getRequester();

        dto.setUserId(otherUser.getId());
        dto.setUsername(otherUser.getUsername());
        dto.setDisplayName(otherUser.getDisplayName());
        dto.setAvatar(otherUser.getAvatar());
        dto.setProfilePictureUrl(otherUser.getProfilePictureUrl());
        dto.setTitle(otherUser.getTitle());
        dto.setProfileBorder(otherUser.getProfileBorder());
        dto.setProfileTheme(otherUser.getProfileTheme());
        dto.setStatus(connection.getStatus().name());
        dto.setCreatedAt(connection.getCreatedAt());
        dto.setAcceptedAt(connection.getAcceptedAt());
        dto.setIsRequester(isRequester);

        return dto;
    }

    // For incoming requests, show the requester
    public static ConnectionDto fromEntityAsRequest(Connection connection) {
        ConnectionDto dto = new ConnectionDto();
        dto.setId(connection.getId());

        var requester = connection.getRequester();
        dto.setUserId(requester.getId());
        dto.setUsername(requester.getUsername());
        dto.setDisplayName(requester.getDisplayName());
        dto.setAvatar(requester.getAvatar());
        dto.setProfilePictureUrl(requester.getProfilePictureUrl());
        dto.setTitle(requester.getTitle());
        dto.setProfileBorder(requester.getProfileBorder());
        dto.setProfileTheme(requester.getProfileTheme());
        dto.setStatus(connection.getStatus().name());
        dto.setCreatedAt(connection.getCreatedAt());
        dto.setIsRequester(false);

        return dto;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getAcceptedAt() {
        return acceptedAt;
    }

    public void setAcceptedAt(LocalDateTime acceptedAt) {
        this.acceptedAt = acceptedAt;
    }

    public Boolean getIsRequester() {
        return isRequester;
    }

    public void setIsRequester(Boolean isRequester) {
        this.isRequester = isRequester;
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
}
