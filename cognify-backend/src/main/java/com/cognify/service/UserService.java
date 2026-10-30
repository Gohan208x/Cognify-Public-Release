package com.cognify.service;

import com.cognify.dto.*;
import com.cognify.entity.*;
import com.cognify.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final DailyQuestRepository questRepository;
    private final DailyChallengeRepository challengeRepository;
    private final PasswordEncoder passwordEncoder;
    @org.springframework.beans.factory.annotation.Value("${app.owner.username:ShivamTanwar}")
    private String ownerUsername;

    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;

    public UserService(UserRepository userRepository, DailyQuestRepository questRepository,
            DailyChallengeRepository challengeRepository, PasswordEncoder passwordEncoder, JwtService jwtService,
            AuthenticationManager authenticationManager, CustomUserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.questRepository = questRepository;
        this.challengeRepository = challengeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
    }

    // Quest pool for generation
    private static final List<Map<String, Object>> QUEST_POOL = Arrays.asList(
            Map.of("label", "Daily Check-in", "target", 1, "xpReward", 10, "coinReward", 5, "type", "CHECKIN",
                    "minLevel", 1),
            Map.of("label", "Focus for 25 mins", "target", 1, "xpReward", 30, "coinReward", 10, "type", "FOCUS",
                    "minLevel", 1),
            Map.of("label", "Create 1 Note", "target", 1, "xpReward", 20, "coinReward", 5, "type", "NOTES", "minLevel",
                    1),
            Map.of("label", "Add 3 Tasks", "target", 3, "xpReward", 15, "coinReward", 5, "type", "PLAN", "minLevel", 2),
            Map.of("label", "Score 80% on Quiz", "target", 1, "xpReward", 50, "coinReward", 20, "type", "REVIEW",
                    "minLevel", 2),
            Map.of("label", "Complete 2 Focus Sessions", "target", 2, "xpReward", 60, "coinReward", 25, "type", "FOCUS",
                    "minLevel", 3),
            Map.of("label", "Review 2 Decks", "target", 2, "xpReward", 40, "coinReward", 15, "type", "REVIEW",
                    "minLevel", 2),
            // New engaging quests
            Map.of("label", "Study for 1 hour total", "target", 1, "xpReward", 80, "coinReward", 40, "type", "FOCUS",
                    "minLevel", 3),
            Map.of("label", "Create 3 Notes", "target", 3, "xpReward", 45, "coinReward", 20, "type", "NOTES",
                    "minLevel",
                    2),
            Map.of("label", "Solve a Doubt", "target", 1, "xpReward", 50, "coinReward", 25, "type", "DOUBT_SOLVE",
                    "minLevel", 2),
            Map.of("label", "Ask a Doubt", "target", 1, "xpReward", 15, "coinReward", 10, "type", "DOUBT_ASK",
                    "minLevel", 1),
            Map.of("label", "Get Perfect Score", "target", 1, "xpReward", 100, "coinReward", 50, "type", "PERFECT_QUIZ",
                    "minLevel", 4),
            Map.of("label", "Complete all Tasks", "target", 5, "xpReward", 40, "coinReward", 20, "type", "PLAN",
                    "minLevel", 3));

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if username exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already taken");
        }

        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setXp(0);
        user.setLevel(1);
        user.setCoins(20);
        user.setStreak(1);
        user.setAvatar("🎓");
        user.setTitle("Novice Student");
        user.setLastLogin(LocalDate.now());
        user.setCreatedAt(LocalDateTime.now());

        // Save security question (immutable after registration)
        user.setSecurityQuestion(request.getSecurityQuestion());
        user.setSecurityAnswer(passwordEncoder.encode(request.getSecurityAnswer().toLowerCase().trim()));

        user = userRepository.save(user);

        // Generate initial quests
        generateDailyQuests(user);

        // Generate token
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(token, UserResponse.fromEntity(user));
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Authenticate
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ============== ADMIN & BAN CHECKS ==============
        // Ensure owner is always admin
        if (ownerUsername != null && ownerUsername.equalsIgnoreCase(user.getUsername()) && !user.getIsAdmin()) {
            user.setIsAdmin(true);
            userRepository.save(user);
        }

        // Check ban status - auto-unban if expired
        if (user.getIsBanned()) {
            if (user.getBanExpiry() != null && user.getBanExpiry().isBefore(LocalDateTime.now())) {
                // Ban has expired, unban the user
                user.setIsBanned(false);
                user.setBanExpiry(null);
                user.setBanReason(null);
                userRepository.save(user);
            } else {
                // Still banned - throw exception with ban info
                String banInfo = "BANNED|" +
                        (user.getBanExpiry() != null ? user.getBanExpiry().toString() : "PERMANENT") +
                        "|" + (user.getBanReason() != null ? user.getBanReason() : "No reason provided");
                throw new RuntimeException(banInfo);
            }
        }

        LocalDate today = LocalDate.now();

        // Update streak logic
        if (user.getLastLogin() != null && !user.getLastLogin().equals(today)) {
            if (user.getLastLogin().plusDays(1).equals(today)) {
                user.setStreak(user.getStreak() + 1);
            } else {
                user.setStreak(1);
            }

            // New day - regenerate quests and challenges
            generateDailyQuests(user);
            generateDailyChallenges(user);
        }

        user.setLastLogin(today);
        userRepository.save(user);

        // Generate token
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(token, UserResponse.fromEntity(user));
    }

    public User getCurrentUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public UserResponse addRewards(Long userId, int xp, int coins) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int newXp = user.getXp() + xp;
        int newCoins = user.getCoins() + coins;
        int newLevel = (newXp / 100) + 1;

        // Level up bonus
        if (newLevel > user.getLevel()) {
            newCoins += 50;
            log.info("🎉 User {} leveled up to level {}", user.getUsername(), newLevel);
        }

        user.setXp(newXp);
        user.setCoins(newCoins);
        user.setLevel(newLevel);

        userRepository.save(user);
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse updateUser(Long userId, UserResponse updates) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.getAvatar() != null)
            user.setAvatar(updates.getAvatar());
        if (updates.getTitle() != null)
            user.setTitle(updates.getTitle());
        if (updates.getActiveTrials() != null)
            user.setActiveTrialsMap(updates.getActiveTrials());

        userRepository.save(user);
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse purchaseItem(Long userId, String itemId, int cost, String itemType, String itemValue) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getCoins() < cost) {
            throw new RuntimeException("Not enough coins");
        }

        user.setCoins(user.getCoins() - cost);
        user.addUnlockedItem(itemId);

        userRepository.save(user);
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public void changePassword(String username, String oldPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Update to new password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Password changed successfully for user: {}", username);
    }

    public String getSecurityQuestion(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getSecurityQuestion() == null || user.getSecurityQuestion().isEmpty()) {
            throw new RuntimeException("No security question set for this user");
        }

        return user.getSecurityQuestion();
    }

    @Transactional
    public void resetPasswordWithSecurityQuestion(String username, String securityAnswer, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getSecurityAnswer() == null || user.getSecurityAnswer().isEmpty()) {
            throw new RuntimeException("No security question set for this account");
        }

        // Verify security answer (case insensitive, trimmed)
        String normalizedAnswer = securityAnswer.toLowerCase().trim();
        if (!passwordEncoder.matches(normalizedAnswer, user.getSecurityAnswer())) {
            throw new RuntimeException("Incorrect security answer");
        }

        // Reset password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Password reset via security question for user: {}", username);
    }

    @Transactional
    public UserResponse equipItem(Long userId, String itemType, String itemValue) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if ("AVATAR".equals(itemType)) {
            user.setAvatar(itemValue);
        } else if ("TITLE".equals(itemType)) {
            user.setTitle(itemValue);
        }

        userRepository.save(user);
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse activateTrial(Long userId, String featureId, int hours) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        long expiryTimestamp = System.currentTimeMillis() + (hours * 60L * 60L * 1000L);
        user.addTrial(featureId, expiryTimestamp);

        userRepository.save(user);
        return UserResponse.fromEntity(user);
    }

    // ============== QUEST METHODS ==============

    @Transactional
    public void generateDailyQuests(User user) {
        LocalDate today = LocalDate.now();

        // Delete old quests
        questRepository.deleteByUserIdAndQuestDateBefore(user.getId(), today);

        // Check if already generated for today
        List<DailyQuest> existing = questRepository.findByUserIdAndQuestDate(user.getId(), today);
        if (!existing.isEmpty())
            return;

        List<DailyQuest> newQuests = new ArrayList<>();

        // Mandatory daily check-in quest (auto-completes on first visit)
        DailyQuest checkinQuest = new DailyQuest();
        checkinQuest.setUser(user);
        checkinQuest.setLabel("Daily Check-in");
        checkinQuest.setTarget(1);
        checkinQuest.setProgress(1); // Auto-complete on first visit
        checkinQuest.setXpReward(10);
        checkinQuest.setCoinReward(5);
        checkinQuest.setCompleted(true); // Already completed
        checkinQuest.setType("CHECKIN");
        checkinQuest.setMinLevel(1);
        checkinQuest.setQuestDate(today);
        newQuests.add(checkinQuest);

        // Give rewards for check-in immediately
        user.setXp(user.getXp() + 10);
        user.setCoins(user.getCoins() + 5);
        userRepository.save(user);

        // Pick 2 random quests based on level
        List<Map<String, Object>> available = new ArrayList<>();
        for (Map<String, Object> q : QUEST_POOL) {
            if (!"CHECKIN".equals(q.get("type")) && (int) q.get("minLevel") <= user.getLevel()) {
                available.add(q);
            }
        }

        Collections.shuffle(available);
        for (int i = 0; i < Math.min(2, available.size()); i++) {
            Map<String, Object> q = available.get(i);
            DailyQuest quest = new DailyQuest();
            quest.setUser(user);
            quest.setLabel((String) q.get("label"));
            quest.setTarget((int) q.get("target"));
            quest.setProgress(0);
            quest.setXpReward((int) q.get("xpReward"));
            quest.setCoinReward((int) q.get("coinReward"));
            quest.setCompleted(false);
            quest.setType((String) q.get("type"));
            quest.setMinLevel((int) q.get("minLevel"));
            quest.setQuestDate(today);
            newQuests.add(quest);
        }

        questRepository.saveAll(newQuests);
    }

    @Transactional
    public List<DailyQuestDto> getQuests(Long userId) {
        LocalDate today = LocalDate.now();
        List<DailyQuest> quests = questRepository.findByUserIdAndQuestDate(userId, today);

        // If no quests exist for today, generate them
        if (quests.isEmpty()) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            generateDailyQuests(user);
            quests = questRepository.findByUserIdAndQuestDate(userId, today);
        }

        return quests.stream()
                .map(DailyQuestDto::fromEntity)
                .toList();
    }

    @Transactional
    public DailyQuestDto updateQuestProgress(Long userId, String type, int amount) {
        LocalDate today = LocalDate.now();
        List<DailyQuest> quests = questRepository.findByUserIdAndQuestDate(userId, today);

        for (DailyQuest quest : quests) {
            if (quest.getType().equals(type) && !quest.getCompleted()) {
                quest.setProgress(quest.getProgress() + amount);

                if (quest.getProgress() >= quest.getTarget()) {
                    quest.setCompleted(true);
                    // Add rewards
                    addRewards(userId, quest.getXpReward(), quest.getCoinReward());
                }

                questRepository.save(quest);
                return DailyQuestDto.fromEntity(quest);
            }
        }

        return null;
    }

    // ============== CHALLENGE METHODS ==============

    @Transactional
    public void generateDailyChallenges(User user) {
        LocalDate today = LocalDate.now();

        // Only generate for level 3+
        if (user.getLevel() < 3)
            return;

        // Delete old challenges
        challengeRepository.deleteByUserIdAndChallengeDateBefore(user.getId(), today);

        // Check if already generated for today
        List<DailyChallenge> existing = challengeRepository.findByUserIdAndChallengeDate(user.getId(), today);
        if (!existing.isEmpty())
            return;

        List<DailyChallenge> newChallenges = new ArrayList<>();

        // Challenge 1: Focus Marathon - 60 min focus session (harder than quest)
        DailyChallenge c1 = new DailyChallenge();
        c1.setUser(user);
        c1.setTitle("Focus Marathon");
        c1.setDescription("Complete a 60-minute Focus Session without interruption. True discipline!");
        c1.setCost(25);
        c1.setXpReward(400);
        c1.setCoinReward(200);
        c1.setTrialFeature(null); // No trial rewards
        c1.setTrialDurationHours(0);
        c1.setExpiresAt(LocalDateTime.now().plusDays(1));
        c1.setStatus("LOCKED");
        c1.setType("FOCUS_MARATHON");
        c1.setTarget(1);
        c1.setProgress(0);
        c1.setChallengeDate(today);
        newChallenges.add(c1);

        // Challenge 2: Quiz Master - Perfect score on any quiz
        DailyChallenge c2 = new DailyChallenge();
        c2.setUser(user);
        c2.setTitle("Quiz Master");
        c2.setDescription("Score 100% on any quiz. Prove your mastery - anything less fails!");
        c2.setCost(20);
        c2.setXpReward(350);
        c2.setCoinReward(175);
        c2.setTrialFeature(null);
        c2.setTrialDurationHours(0);
        c2.setExpiresAt(LocalDateTime.now().plusDays(1));
        c2.setStatus("LOCKED");
        c2.setType("QUIZ_STREAK");
        c2.setTarget(1);
        c2.setProgress(0);
        c2.setChallengeDate(today);
        newChallenges.add(c2);

        // Challenge 3: Note Sprint - Create 7 notes (harder than 5)
        DailyChallenge c3 = new DailyChallenge();
        c3.setUser(user);
        c3.setTitle("Note Sprint");
        c3.setDescription("Create 7 AI-powered study notes. Build your knowledge arsenal!");
        c3.setCost(30);
        c3.setXpReward(300);
        c3.setCoinReward(150);
        c3.setTrialFeature(null);
        c3.setTrialDurationHours(0);
        c3.setExpiresAt(LocalDateTime.now().plusDays(1));
        c3.setStatus("LOCKED");
        c3.setType("NOTE_SPRINT");
        c3.setTarget(7);
        c3.setProgress(0);
        c3.setChallengeDate(today);
        newChallenges.add(c3);

        // Challenge 4: Community Hero - Solve 3 doubts (harder than 2)
        DailyChallenge c4 = new DailyChallenge();
        c4.setUser(user);
        c4.setTitle("Community Hero");
        c4.setDescription("Help 3 students by solving their doubts. Become a legend!");
        c4.setCost(35);
        c4.setXpReward(450);
        c4.setCoinReward(225);
        c4.setTrialFeature(null);
        c4.setTrialDurationHours(0);
        c4.setExpiresAt(LocalDateTime.now().plusDays(1));
        c4.setStatus("LOCKED");
        c4.setType("DOUBT_SOLVER");
        c4.setTarget(3);
        c4.setProgress(0);
        c4.setChallengeDate(today);
        newChallenges.add(c4);

        challengeRepository.saveAll(newChallenges);
    }

    @Transactional
    public List<DailyChallengeDto> getChallenges(Long userId) {
        LocalDate today = LocalDate.now();
        return challengeRepository.findByUserIdAndChallengeDate(userId, today)
                .stream()
                .map(DailyChallengeDto::fromEntity)
                .toList();
    }

    @Transactional
    public DailyChallengeDto activateChallenge(Long userId, Long challengeId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        DailyChallenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));

        if (user.getCoins() < challenge.getCost()) {
            throw new RuntimeException("Not enough coins");
        }

        user.setCoins(user.getCoins() - challenge.getCost());
        challenge.setStatus("ACTIVE");

        userRepository.save(user);
        challengeRepository.save(challenge);

        return DailyChallengeDto.fromEntity(challenge);
    }

    @Transactional
    public DailyChallengeDto updateChallengeProgress(Long userId, String type, int value) {
        LocalDate today = LocalDate.now();
        List<DailyChallenge> challenges = challengeRepository.findByUserIdAndChallengeDate(userId, today);

        for (DailyChallenge c : challenges) {
            if (c.getStatus().equals("ACTIVE") && c.getType().equals(type)) {
                // Special check for focus marathon
                if (c.getType().equals("FOCUS_MARATHON") && value < 45)
                    continue;

                c.setProgress(c.getProgress() + 1);

                if (c.getProgress() >= c.getTarget()) {
                    c.setStatus("COMPLETED");
                    addRewards(userId, c.getXpReward(), c.getCoinReward());

                    // Activate trial if applicable
                    if (c.getTrialFeature() != null && c.getTrialDurationHours() > 0) {
                        activateTrial(userId, c.getTrialFeature(), c.getTrialDurationHours());
                    }
                }

                challengeRepository.save(c);
                return DailyChallengeDto.fromEntity(c);
            }
        }

        return null;
    }

    @Transactional
    public DailyChallengeDto failChallenge(Long userId, Long challengeId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        DailyChallenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));

        int penalty = 50;
        user.setXp(Math.max(0, user.getXp() - penalty));
        challenge.setStatus("FAILED");

        userRepository.save(user);
        challengeRepository.save(challenge);

        return DailyChallengeDto.fromEntity(challenge);
    }
}
