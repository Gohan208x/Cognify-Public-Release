package com.cognify.dto;

import com.cognify.entity.DailyChallenge;

public class DailyChallengeDto {
    private String id;
    private String title;
    private String description;
    private int cost;
    private int xpReward;
    private int coinReward;
    private String trialFeature;
    private int trialDurationHours;
    private long expiresAt;
    private String status;
    private String type;
    private int target;
    private int progress;

    public DailyChallengeDto() {
    }

    public DailyChallengeDto(String id, String title, String description, int cost, int xpReward, int coinReward,
            String trialFeature, int trialDurationHours, long expiresAt, String status, String type, int target,
            int progress) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.cost = cost;
        this.xpReward = xpReward;
        this.coinReward = coinReward;
        this.trialFeature = trialFeature;
        this.trialDurationHours = trialDurationHours;
        this.expiresAt = expiresAt;
        this.status = status;
        this.type = type;
        this.target = target;
        this.progress = progress;
    }

    public static DailyChallengeDto fromEntity(DailyChallenge c) {
        return new DailyChallengeDto(
                c.getId().toString(),
                c.getTitle(),
                c.getDescription(),
                c.getCost(),
                c.getXpReward(),
                c.getCoinReward(),
                c.getTrialFeature(),
                c.getTrialDurationHours() != null ? c.getTrialDurationHours() : 0,
                c.getExpiresAt() != null
                        ? c.getExpiresAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli()
                        : 0,
                c.getStatus(),
                c.getType(),
                c.getTarget(),
                c.getProgress());
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
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

    public int getCost() {
        return cost;
    }

    public void setCost(int cost) {
        this.cost = cost;
    }

    public int getXpReward() {
        return xpReward;
    }

    public void setXpReward(int xpReward) {
        this.xpReward = xpReward;
    }

    public int getCoinReward() {
        return coinReward;
    }

    public void setCoinReward(int coinReward) {
        this.coinReward = coinReward;
    }

    public String getTrialFeature() {
        return trialFeature;
    }

    public void setTrialFeature(String trialFeature) {
        this.trialFeature = trialFeature;
    }

    public int getTrialDurationHours() {
        return trialDurationHours;
    }

    public void setTrialDurationHours(int trialDurationHours) {
        this.trialDurationHours = trialDurationHours;
    }

    public long getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(long expiresAt) {
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

    public int getTarget() {
        return target;
    }

    public void setTarget(int target) {
        this.target = target;
    }

    public int getProgress() {
        return progress;
    }

    public void setProgress(int progress) {
        this.progress = progress;
    }
}
