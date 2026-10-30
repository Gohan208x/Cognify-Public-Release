package com.cognify.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "planner_events")
public class PlannerEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "\"day\"", nullable = false, length = 20)
    private String day; // 'Monday', 'Tuesday', etc.

    @Column(name = "\"time\"", nullable = false, length = 10)
    private String time; // "14:00"

    @Column(length = 100)
    private String subject;

    private Boolean completed = false;

    private Boolean rewardClaimed = false;

    private Boolean notified = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Default Constructor
    public PlannerEvent() {
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

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }

    public Boolean getRewardClaimed() {
        return rewardClaimed;
    }

    public void setRewardClaimed(Boolean rewardClaimed) {
        this.rewardClaimed = rewardClaimed;
    }

    public Boolean getNotified() {
        return notified;
    }

    public void setNotified(Boolean notified) {
        this.notified = notified;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
