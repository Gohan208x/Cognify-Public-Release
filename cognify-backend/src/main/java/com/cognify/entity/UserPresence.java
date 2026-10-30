package com.cognify.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * UserPresence entity for tracking online/offline status of users.
 */
@Entity
@Table(name = "user_presence")
public class UserPresence {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "last_seen")
    private LocalDateTime lastSeen;

    @Column(name = "is_online")
    private Boolean isOnline = false;

    @Column(name = "current_channel_id")
    private Long currentChannelId; // Which channel they're viewing

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public LocalDateTime getLastSeen() {
        return lastSeen;
    }

    public void setLastSeen(LocalDateTime lastSeen) {
        this.lastSeen = lastSeen;
    }

    public Boolean getIsOnline() {
        return isOnline;
    }

    public void setIsOnline(Boolean isOnline) {
        this.isOnline = isOnline;
    }

    public Long getCurrentChannelId() {
        return currentChannelId;
    }

    public void setCurrentChannelId(Long currentChannelId) {
        this.currentChannelId = currentChannelId;
    }
}
