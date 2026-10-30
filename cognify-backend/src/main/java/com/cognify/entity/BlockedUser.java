package com.cognify.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity representing a blocked user relationship.
 * When user A blocks user B, user B cannot:
 * - Send connection requests to user A
 * - View user A's profile
 */
@Entity
@Table(name = "blocked_users", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "blocker_id", "blocked_id" })
})
public class BlockedUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "blocker_id", nullable = false)
    private User blocker;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "blocked_id", nullable = false)
    private User blocked;

    private LocalDateTime createdAt = LocalDateTime.now();

    // Constructors
    public BlockedUser() {
    }

    public BlockedUser(User blocker, User blocked) {
        this.blocker = blocker;
        this.blocked = blocked;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getBlocker() {
        return blocker;
    }

    public void setBlocker(User blocker) {
        this.blocker = blocker;
    }

    public User getBlocked() {
        return blocked;
    }

    public void setBlocked(User blocked) {
        this.blocked = blocked;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
