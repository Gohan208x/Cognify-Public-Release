package com.cognify.dto;

import com.cognify.entity.BlockedUser;
import java.time.LocalDateTime;

/**
 * DTO for blocked user data
 */
public class BlockedUserDto {
    private Long id;
    private Long userId;
    private String username;
    private String displayName;
    private String avatar;
    private LocalDateTime blockedAt;

    public BlockedUserDto() {
    }

    public static BlockedUserDto fromEntity(BlockedUser blockedUser) {
        BlockedUserDto dto = new BlockedUserDto();
        dto.setId(blockedUser.getId());
        dto.setUserId(blockedUser.getBlocked().getId());
        dto.setUsername(blockedUser.getBlocked().getUsername());
        dto.setDisplayName(blockedUser.getBlocked().getDisplayName());
        dto.setAvatar(blockedUser.getBlocked().getAvatar());
        dto.setBlockedAt(blockedUser.getCreatedAt());
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

    public LocalDateTime getBlockedAt() {
        return blockedAt;
    }

    public void setBlockedAt(LocalDateTime blockedAt) {
        this.blockedAt = blockedAt;
    }
}
