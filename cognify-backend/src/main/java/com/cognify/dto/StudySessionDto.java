package com.cognify.dto;

import com.cognify.entity.StudySession;

public class StudySessionDto {
    private String id;
    private String timestamp;
    private int duration;
    private String activityType;
    private String subject;
    private Integer score;
    private Integer maxScore;

    public StudySessionDto() {
    }

    public StudySessionDto(String id, String timestamp, int duration, String activityType, String subject,
            Integer score, Integer maxScore) {
        this.id = id;
        this.timestamp = timestamp;
        this.duration = duration;
        this.activityType = activityType;
        this.subject = subject;
        this.score = score;
        this.maxScore = maxScore;
    }

    public static StudySessionDto fromEntity(StudySession session) {
        return new StudySessionDto(
                session.getId().toString(),
                session.getTimestamp().toString(),
                session.getDuration(),
                session.getActivityType(),
                session.getSubject(),
                session.getScore(),
                session.getMaxScore());
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public int getDuration() {
        return duration;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

    public String getActivityType() {
        return activityType;
    }

    public void setActivityType(String activityType) {
        this.activityType = activityType;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Integer getMaxScore() {
        return maxScore;
    }

    public void setMaxScore(Integer maxScore) {
        this.maxScore = maxScore;
    }
}
