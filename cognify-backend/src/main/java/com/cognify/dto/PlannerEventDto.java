package com.cognify.dto;

import com.cognify.entity.PlannerEvent;

public class PlannerEventDto {
    private String id;
    private String title;
    private String day;
    private String time;
    private String subject;
    private boolean completed;
    private boolean rewardClaimed;
    private boolean notified;

    public PlannerEventDto() {
    }

    public PlannerEventDto(String id, String title, String day, String time, String subject, boolean completed,
            boolean rewardClaimed, boolean notified) {
        this.id = id;
        this.title = title;
        this.day = day;
        this.time = time;
        this.subject = subject;
        this.completed = completed;
        this.rewardClaimed = rewardClaimed;
        this.notified = notified;
    }

    public static PlannerEventDto fromEntity(PlannerEvent event) {
        return new PlannerEventDto(
                event.getId().toString(),
                event.getTitle(),
                event.getDay(),
                event.getTime(),
                event.getSubject(),
                event.getCompleted(),
                event.getRewardClaimed(),
                event.getNotified());
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

    public String getDay() {
        return day;
    }

    public void setDay(String day) {
        this.day = day;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public boolean isRewardClaimed() {
        return rewardClaimed;
    }

    public void setRewardClaimed(boolean rewardClaimed) {
        this.rewardClaimed = rewardClaimed;
    }

    public boolean isNotified() {
        return notified;
    }

    public void setNotified(boolean notified) {
        this.notified = notified;
    }
}
