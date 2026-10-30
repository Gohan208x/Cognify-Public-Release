package com.cognify.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Tracks which users have liked which solutions.
 * Prevents spam liking by ensuring one like per user per solution.
 */
@Entity
@Table(name = "solution_likes", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "solution_id", "user_id" })
})
public class SolutionLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "solution_id", nullable = false)
    private Long solutionId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSolutionId() {
        return solutionId;
    }

    public void setSolutionId(Long solutionId) {
        this.solutionId = solutionId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
