package com.cognify.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_challenges")
public class DailyChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Integer cost; // Coins to activate

    private Integer xpReward;

    private Integer coinReward;

    @Column(length = 50)
    private String trialFeature; // ID of feature to unlock (e.g., 'PANIC_MODE')

    private Integer trialDurationHours;

    private LocalDateTime expiresAt;

    @Column(nullable = false, length = 20)
    private String status = "LOCKED"; // 'LOCKED', 'ACTIVE', 'COMPLETED', 'FAILED'

    @Column(nullable = false, length = 30)
    private String type; // 'QUIZ_STREAK', 'FOCUS_MARATHON', 'NOTE_MASTER'

    private Integer target;

    private Integer progress = 0;

    private LocalDate challengeDate = LocalDate.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public DailyChallenge() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getCost() {
        return cost;
    }

    public void setCost(Integer cost) {
        this.cost = cost;
    }

    public Integer getXpReward() {
        return xpReward;
    }

    public void setXpReward(Integer xpReward) {
        this.xpReward = xpReward;
    }

    public Integer getCoinReward() {
        return coinReward;
    }

    public void setCoinReward(Integer coinReward) {
        this.coinReward = coinReward;
    }

    public String getTrialFeature() {
        return trialFeature;
    }

    public void setTrialFeature(String trialFeature) {
        this.trialFeature = trialFeature;
    }

    public Integer getTrialDurationHours() {
        return trialDurationHours;
    }

    public void setTrialDurationHours(Integer trialDurationHours) {
        this.trialDurationHours = trialDurationHours;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getTarget() {
        return target;
    }

    public void setTarget(Integer target) {
        this.target = target;
    }

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public LocalDate getChallengeDate() {
        return challengeDate;
    }

    public void setChallengeDate(LocalDate challengeDate) {
        this.challengeDate = challengeDate;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
