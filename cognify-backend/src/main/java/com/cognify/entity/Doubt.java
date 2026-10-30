package com.cognify.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Doubt entity representing a question posted in the doubt channel.
 * Users can post doubts with optional images, and others can solve them.
 */
@Entity
@Table(name = "doubts")
public class Doubt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "author_id", nullable = false)
    private Long authorId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    @Column(name = "image_url")
    private String imageUrl; // Optional attached image

    private String course; // e.g., "CSE", "IT", "ECE"

    @Column(nullable = false)
    private String status; // OPEN, SOLVED

    @Column(name = "solver_id")
    private Long solverId; // User who solved it

    @Column(name = "coins_rewarded")
    private Integer coinsRewarded; // Coins given to solver

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "solved_at")
    private LocalDateTime solvedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null)
            status = "OPEN";
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAuthorId() {
        return authorId;
    }

    public void setAuthorId(Long authorId) {
        this.authorId = authorId;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getCourse() {
        return course;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getSolverId() {
        return solverId;
    }

    public void setSolverId(Long solverId) {
        this.solverId = solverId;
    }

    public Integer getCoinsRewarded() {
        return coinsRewarded;
    }

    public void setCoinsRewarded(Integer coinsRewarded) {
        this.coinsRewarded = coinsRewarded;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getSolvedAt() {
        return solvedAt;
    }

    public void setSolvedAt(LocalDateTime solvedAt) {
        this.solvedAt = solvedAt;
    }
}
