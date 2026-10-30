package com.cognify.dto;

public class GeminiRequest {
    private String topic;
    private String content;
    private String pyqContent;
    private String syllabusContext;
    private String subjects;
    private String userContext;
    private String moduleTitle;
    private Integer quizScore;
    private Integer totalQuestions;
    private String imageUrl;

    public GeminiRequest() {
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getPyqContent() {
        return pyqContent;
    }

    public void setPyqContent(String pyqContent) {
        this.pyqContent = pyqContent;
    }

    public String getSyllabusContext() {
        return syllabusContext;
    }

    public void setSyllabusContext(String syllabusContext) {
        this.syllabusContext = syllabusContext;
    }

    public String getSubjects() {
        return subjects;
    }

    public void setSubjects(String subjects) {
        this.subjects = subjects;
    }

    public String getUserContext() {
        return userContext;
    }

    public void setUserContext(String userContext) {
        this.userContext = userContext;
    }

    public String getModuleTitle() {
        return moduleTitle;
    }

    public void setModuleTitle(String moduleTitle) {
        this.moduleTitle = moduleTitle;
    }

    public Integer getQuizScore() {
        return quizScore;
    }

    public void setQuizScore(Integer quizScore) {
        this.quizScore = quizScore;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
