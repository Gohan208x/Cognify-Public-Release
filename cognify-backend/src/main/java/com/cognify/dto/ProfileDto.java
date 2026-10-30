package com.cognify.dto;

import com.cognify.entity.User;
import java.util.List;

public class ProfileDto {
    private Long id;
    private String username;
    private String displayName;
    private String bio;
    private String college;
    private String country;
    private Boolean countryVisible;
    private String email;
    private Boolean emailVisible;
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
    private String profilePictureUrl;
    private List<String> skills;
    private Boolean profileComplete;

    // Stats
    private Integer level;
    private Integer xp;
    private Integer totalStudyMinutes;
    private Integer totalQuizzesTaken;
    private Double averageQuizScore;
    private String avatar;
    private String title;

    // Design customization
    private String profileBorder;
    private String profileBanner;
    private String profileTheme;
    private String profileBackground;

    // Badge stats
    private Integer streak;
    private Integer highestStreak;
    private Integer challengesCompleted;

    public ProfileDto() {
    }

    public static ProfileDto fromEntity(User user, boolean isOwnProfile) {
        ProfileDto dto = new ProfileDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setDisplayName(user.getDisplayName());
        dto.setBio(user.getBio());
        dto.setCollege(user.getCollege());

        // Respect privacy settings
        if (isOwnProfile || Boolean.TRUE.equals(user.getCountryVisible())) {
            dto.setCountry(user.getCountry());
        }
        dto.setCountryVisible(user.getCountryVisible());

        if (isOwnProfile || Boolean.TRUE.equals(user.getEmailVisible())) {
            dto.setEmail(user.getEmail());
        }
        dto.setEmailVisible(user.getEmailVisible());

        dto.setGithubUrl(user.getGithubUrl());
        dto.setLinkedinUrl(user.getLinkedinUrl());
        dto.setPortfolioUrl(user.getPortfolioUrl());
        dto.setProfilePictureUrl(user.getProfilePictureUrl());
        dto.setSkills(user.getSkillsList());
        dto.setProfileComplete(user.getProfileComplete());

        // Stats
        dto.setLevel(user.getLevel());
        dto.setXp(user.getXp());
        dto.setTotalStudyMinutes(user.getTotalStudyMinutes());
        dto.setTotalQuizzesTaken(user.getTotalQuizzesTaken());
        dto.setAverageQuizScore(user.getAverageQuizScore());
        dto.setAvatar(user.getAvatar());
        dto.setTitle(user.getTitle());

        // Design customization
        dto.setProfileBorder(user.getProfileBorder());
        dto.setProfileBanner(user.getProfileBanner());
        dto.setProfileTheme(user.getProfileTheme());
        dto.setProfileBackground(user.getProfileBackground());

        // Badge stats
        dto.setStreak(user.getStreak());
        dto.setHighestStreak(user.getHighestStreak());
        dto.setChallengesCompleted(0); // Calculate from dailyChallenges if needed

        return dto;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getCollege() {
        return college;
    }

    public void setCollege(String college) {
        this.college = college;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public Boolean getCountryVisible() {
        return countryVisible;
    }

    public void setCountryVisible(Boolean countryVisible) {
        this.countryVisible = countryVisible;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Boolean getEmailVisible() {
        return emailVisible;
    }

    public void setEmailVisible(Boolean emailVisible) {
        this.emailVisible = emailVisible;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }

    public String getPortfolioUrl() {
        return portfolioUrl;
    }

    public void setPortfolioUrl(String portfolioUrl) {
        this.portfolioUrl = portfolioUrl;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public Boolean getProfileComplete() {
        return profileComplete;
    }

    public void setProfileComplete(Boolean profileComplete) {
        this.profileComplete = profileComplete;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public Integer getXp() {
        return xp;
    }

    public void setXp(Integer xp) {
        this.xp = xp;
    }

    public Integer getTotalStudyMinutes() {
        return totalStudyMinutes;
    }

    public void setTotalStudyMinutes(Integer totalStudyMinutes) {
        this.totalStudyMinutes = totalStudyMinutes;
    }

    public Integer getTotalQuizzesTaken() {
        return totalQuizzesTaken;
    }

    public void setTotalQuizzesTaken(Integer totalQuizzesTaken) {
        this.totalQuizzesTaken = totalQuizzesTaken;
    }

    public Double getAverageQuizScore() {
        return averageQuizScore;
    }

    public void setAverageQuizScore(Double averageQuizScore) {
        this.averageQuizScore = averageQuizScore;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    // Design customization getters/setters
    public String getProfileBorder() {
        return profileBorder;
    }

    public void setProfileBorder(String profileBorder) {
        this.profileBorder = profileBorder;
    }

    public String getProfileBanner() {
        return profileBanner;
    }

    public void setProfileBanner(String profileBanner) {
        this.profileBanner = profileBanner;
    }

    public String getProfileTheme() {
        return profileTheme;
    }

    public void setProfileTheme(String profileTheme) {
        this.profileTheme = profileTheme;
    }

    public String getProfileBackground() {
        return profileBackground;
    }

    public void setProfileBackground(String profileBackground) {
        this.profileBackground = profileBackground;
    }

    public Integer getStreak() {
        return streak;
    }

    public void setStreak(Integer streak) {
        this.streak = streak;
    }

    public Integer getHighestStreak() {
        return highestStreak;
    }

    public void setHighestStreak(Integer highestStreak) {
        this.highestStreak = highestStreak;
    }

    public Integer getChallengesCompleted() {
        return challengesCompleted;
    }

    public void setChallengesCompleted(Integer challengesCompleted) {
        this.challengesCompleted = challengesCompleted;
    }
}
