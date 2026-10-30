package com.cognify.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(nullable = false)
    private String passwordHash;

    @Column(unique = true, length = 100)
    private String email;

    private Integer xp = 0;

    private Integer level = 1;

    private Integer coins = 20;

    private Integer streak = 0;

    private Integer highestStreak = 0;

    @Column(length = 10)
    private String avatar = "🎓";

    @Column(length = 100)
    private String title = "Novice Student";

    private LocalDate lastLogin;

    private LocalDateTime createdAt = LocalDateTime.now();

    // Store unlocked item IDs as comma-separated string
    @Column(columnDefinition = "TEXT")
    private String unlockedItems = "";

    // Store active trials as JSON string (featureId:expiryTimestamp pairs)
    @Column(columnDefinition = "TEXT")
    private String activeTrials = "";

    // ============== PROFILE FIELDS ==============
    @Column(length = 100)
    private String displayName;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(length = 200)
    private String college;

    @Column(length = 100)
    private String country;

    private Boolean countryVisible = true;

    private Boolean emailVisible = false;

    @Column(length = 255)
    private String githubUrl;

    @Column(length = 255)
    private String linkedinUrl;

    @Column(length = 255)
    private String portfolioUrl;

    @Column(columnDefinition = "TEXT")
    private String profilePictureUrl;

    // Store skills as comma-separated for simplicity (avoid extra table for small
    // data)
    @Column(columnDefinition = "TEXT")
    private String skills = "";

    private Boolean profileComplete = false;

    private Integer totalStudyMinutes = 0;

    private Integer totalQuizzesTaken = 0;

    private Double averageQuizScore = 0.0;

    // Design customization fields
    @Column(length = 50)
    private String profileBorder = "bd_default";

    @Column(columnDefinition = "TEXT")
    private String profileBanner = "bn_default";

    @Column(length = 50)
    private String profileTheme = "th_default";

    @Column(length = 50)
    private String profileBackground = "bg_default";

    // ============== DOUBT SOLVING FIELDS ==============
    private Integer doubtsSolved = 0;

    @Column(length = 50)
    private String doubtTitle; // Current equipped doubt solver title

    @Column(columnDefinition = "TEXT")
    private String earnedDoubtTitles = ""; // Comma-separated list of earned title IDs

    // ============== SECURITY QUESTION FIELDS ==============
    @Column(length = 200)
    private String securityQuestion; // Dropdown question chosen during registration

    @Column(length = 200)
    private String securityAnswer; // Hashed answer - cannot be changed after registration

    // ============== ADMIN & BAN FIELDS ==============
    private Boolean isAdmin = false; // Whether user has admin privileges

    private Boolean isBanned = false; // Whether user is currently banned

    private java.time.LocalDateTime banExpiry; // When the ban expires (null = permanent ban)

    @Column(length = 500)
    private String banReason; // Reason for the ban

    @Column(columnDefinition = "TEXT")
    private String badges = ""; // Comma-separated badge IDs

    // Relationships
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Deck> decks = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlannerEvent> plannerEvents = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StudySession> studySessions = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DailyQuest> dailyQuests = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DailyChallenge> dailyChallenges = new ArrayList<>();

    // Default Constructor
    public User() {
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

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Integer getXp() {
        return xp;
    }

    public void setXp(Integer xp) {
        this.xp = xp;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public Integer getCoins() {
        return coins;
    }

    public void setCoins(Integer coins) {
        this.coins = coins;
    }

    public Integer getStreak() {
        return streak;
    }

    public void setStreak(Integer streak) {
        this.streak = streak;
        // Update highest streak if current streak is higher
        if (streak != null && (this.highestStreak == null || streak > this.highestStreak)) {
            this.highestStreak = streak;
        }
    }

    public Integer getHighestStreak() {
        return highestStreak;
    }

    public void setHighestStreak(Integer highestStreak) {
        this.highestStreak = highestStreak;
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

    public LocalDate getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDate lastLogin) {
        this.lastLogin = lastLogin;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getUnlockedItems() {
        return unlockedItems;
    }

    public void setUnlockedItems(String unlockedItems) {
        this.unlockedItems = unlockedItems;
    }

    public String getActiveTrials() {
        return activeTrials;
    }

    public void setActiveTrials(String activeTrials) {
        this.activeTrials = activeTrials;
    }

    public List<Deck> getDecks() {
        return decks;
    }

    public void setDecks(List<Deck> decks) {
        this.decks = decks;
    }

    public List<PlannerEvent> getPlannerEvents() {
        return plannerEvents;
    }

    public void setPlannerEvents(List<PlannerEvent> plannerEvents) {
        this.plannerEvents = plannerEvents;
    }

    public List<StudySession> getStudySessions() {
        return studySessions;
    }

    public void setStudySessions(List<StudySession> studySessions) {
        this.studySessions = studySessions;
    }

    public List<DailyQuest> getDailyQuests() {
        return dailyQuests;
    }

    public void setDailyQuests(List<DailyQuest> dailyQuests) {
        this.dailyQuests = dailyQuests;
    }

    public List<DailyChallenge> getDailyChallenges() {
        return dailyChallenges;
    }

    public void setDailyChallenges(List<DailyChallenge> dailyChallenges) {
        this.dailyChallenges = dailyChallenges;
    }

    // Helper methods for unlocked items
    public List<String> getUnlockedItemsList() {
        if (unlockedItems == null || unlockedItems.isEmpty()) {
            return new ArrayList<>();
        }
        return new ArrayList<>(List.of(unlockedItems.split(",")));
    }

    public void addUnlockedItem(String itemId) {
        List<String> items = getUnlockedItemsList();
        if (!items.contains(itemId)) {
            items.add(itemId);
            this.unlockedItems = String.join(",", items);
        }
    }

    // Helper methods for active trials
    public Map<String, Long> getActiveTrialsMap() {
        Map<String, Long> trials = new HashMap<>();
        if (activeTrials == null || activeTrials.isEmpty()) {
            return trials;
        }
        for (String pair : activeTrials.split(";")) {
            String[] parts = pair.split(":");
            if (parts.length == 2) {
                trials.put(parts[0], Long.parseLong(parts[1]));
            }
        }
        return trials;
    }

    public void setActiveTrialsMap(Map<String, Long> trials) {
        StringBuilder sb = new StringBuilder();
        trials.forEach((key, value) -> {
            if (sb.length() > 0)
                sb.append(";");
            sb.append(key).append(":").append(value);
        });
        this.activeTrials = sb.toString();
    }

    public void addTrial(String featureId, long expiryTimestamp) {
        Map<String, Long> trials = getActiveTrialsMap();
        trials.put(featureId, expiryTimestamp);
        setActiveTrialsMap(trials);
    }

    // ============== PROFILE GETTERS/SETTERS ==============
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

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public Boolean getProfileComplete() {
        return profileComplete;
    }

    public void setProfileComplete(Boolean profileComplete) {
        this.profileComplete = profileComplete;
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

    // Helper methods for skills
    public List<String> getSkillsList() {
        if (skills == null || skills.isEmpty()) {
            return new ArrayList<>();
        }
        return new ArrayList<>(List.of(skills.split(",")));
    }

    public void addSkill(String skill) {
        List<String> skillList = getSkillsList();
        if (!skillList.contains(skill.trim())) {
            skillList.add(skill.trim());
            this.skills = String.join(",", skillList);
        }
    }

    public void removeSkill(String skill) {
        List<String> skillList = getSkillsList();
        skillList.remove(skill.trim());
        this.skills = String.join(",", skillList);
    }

    // ============== DESIGN CUSTOMIZATION GETTERS/SETTERS ==============
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

    // ============== DOUBT SOLVING GETTERS/SETTERS ==============
    public Integer getDoubtsSolved() {
        return doubtsSolved;
    }

    public void setDoubtsSolved(Integer doubtsSolved) {
        this.doubtsSolved = doubtsSolved;
    }

    public String getDoubtTitle() {
        return doubtTitle;
    }

    public void setDoubtTitle(String doubtTitle) {
        this.doubtTitle = doubtTitle;
    }

    public String getEarnedDoubtTitles() {
        return earnedDoubtTitles;
    }

    public void setEarnedDoubtTitles(String earnedDoubtTitles) {
        this.earnedDoubtTitles = earnedDoubtTitles;
    }

    // Helper methods for earned doubt titles
    public List<String> getEarnedDoubtTitlesList() {
        if (earnedDoubtTitles == null || earnedDoubtTitles.isEmpty()) {
            return new ArrayList<>();
        }
        return new ArrayList<>(List.of(earnedDoubtTitles.split(",")));
    }

    public void addEarnedDoubtTitle(String titleId) {
        List<String> titles = getEarnedDoubtTitlesList();
        if (!titles.contains(titleId)) {
            titles.add(titleId);
            this.earnedDoubtTitles = String.join(",", titles);
        }
    }

    public void incrementDoubtsSolved() {
        this.doubtsSolved = (this.doubtsSolved == null ? 0 : this.doubtsSolved) + 1;
    }

    // Security question getters/setters
    public String getSecurityQuestion() {
        return securityQuestion;
    }

    public void setSecurityQuestion(String securityQuestion) {
        this.securityQuestion = securityQuestion;
    }

    public String getSecurityAnswer() {
        return securityAnswer;
    }

    public void setSecurityAnswer(String securityAnswer) {
        this.securityAnswer = securityAnswer;
    }

    // Admin & Ban getters/setters
    public Boolean getIsAdmin() {
        return isAdmin != null ? isAdmin : false;
    }

    public void setIsAdmin(Boolean isAdmin) {
        this.isAdmin = isAdmin;
    }

    public Boolean getIsBanned() {
        return isBanned != null ? isBanned : false;
    }

    public void setIsBanned(Boolean isBanned) {
        this.isBanned = isBanned;
    }

    public java.time.LocalDateTime getBanExpiry() {
        return banExpiry;
    }

    public void setBanExpiry(java.time.LocalDateTime banExpiry) {
        this.banExpiry = banExpiry;
    }

    public String getBanReason() {
        return banReason;
    }

    public void setBanReason(String banReason) {
        this.banReason = banReason;
    }

    public String getBadges() {
        return badges != null ? badges : "";
    }

    public void setBadges(String badges) {
        this.badges = badges;
    }
}
