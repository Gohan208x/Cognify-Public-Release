package com.cognify.dto;

import com.cognify.entity.DailyQuest;

public class DailyQuestDto {
    private String id;
    private String label;
    private int target;
    private int progress;
    private int xpReward;
    private int coinReward;
    private boolean completed;
    private String type;
    private int minLevel;

    public DailyQuestDto() {
    }

    public DailyQuestDto(String id, String label, int target, int progress, int xpReward, int coinReward,
            boolean completed, String type, int minLevel) {
        this.id = id;
        this.label = label;
        this.target = target;
        this.progress = progress;
        this.xpReward = xpReward;
        this.coinReward = coinReward;
        this.completed = completed;
        this.type = type;
        this.minLevel = minLevel;
    }

    public static DailyQuestDto fromEntity(DailyQuest quest) {
        return new DailyQuestDto(
                quest.getId().toString(),
                quest.getLabel(),
                quest.getTarget(),
                quest.getProgress(),
                quest.getXpReward(),
                quest.getCoinReward(),
                quest.getCompleted(),
                quest.getType(),
                quest.getMinLevel());
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
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

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public int getMinLevel() {
        return minLevel;
    }

    public void setMinLevel(int minLevel) {
        this.minLevel = minLevel;
    }
}
