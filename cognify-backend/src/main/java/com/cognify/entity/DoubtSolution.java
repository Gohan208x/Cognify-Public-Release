package com.cognify.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * DoubtSolution entity representing a solution submitted for a doubt.
 * Tracks the explanation, likes, and rewards.
 */
@Entity
@Table(name = "doubt_solutions")
public class DoubtSolution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "doubt_id", nullable = false)
    private Long doubtId;

    @Column(name = "solver_id", nullable = false)
    private Long solverId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "image_url")
    private String imageUrl; // Optional explanation image

    private Integer likes = 0;

    @Column(name = "is_accepted")
    private Boolean isAccepted = false; // Whether author accepted this solution

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (likes == null)
            likes = 0;
        if (isAccepted == null)
            isAccepted = false;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getDoubtId() {
        return doubtId;
    }

    public void setDoubtId(Long doubtId) {
        this.doubtId = doubtId;
    }

    public Long getSolverId() {
        return solverId;
    }

    public void setSolverId(Long solverId) {
        this.solverId = solverId;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getLikes() {
        return likes;
    }

    public void setLikes(Integer likes) {
        this.likes = likes;
    }

    public Boolean getIsAccepted() {
        return isAccepted;
    }

    public void setIsAccepted(Boolean isAccepted) {
        this.isAccepted = isAccepted;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
