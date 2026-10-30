package com.cognify.service;

import com.cognify.dto.StudySessionDto;
import com.cognify.entity.StudySession;
import com.cognify.entity.User;
import com.cognify.repository.StudySessionRepository;
import com.cognify.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StudySessionService {

    private static final Logger log = LoggerFactory.getLogger(StudySessionService.class);

    private final StudySessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public StudySessionService(StudySessionRepository sessionRepository, UserRepository userRepository,
            UserService userService) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    public List<StudySessionDto> getUserSessions(Long userId) {
        return sessionRepository.findByUserIdOrderByTimestampDesc(userId)
                .stream()
                .map(StudySessionDto::fromEntity)
                .toList();
    }

    public List<StudySessionDto> getRecentSessions(Long userId, int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        return sessionRepository.findRecentSessions(userId, startDate)
                .stream()
                .map(StudySessionDto::fromEntity)
                .toList();
    }

    @Transactional
    public StudySessionDto trackSession(Long userId, StudySessionDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        StudySession session = new StudySession();
        session.setUser(user);
        session.setTimestamp(LocalDateTime.now());
        session.setDuration(request.getDuration());
        session.setActivityType(request.getActivityType());
        session.setSubject(request.getSubject());
        session.setScore(request.getScore());
        session.setMaxScore(request.getMaxScore());

        session = sessionRepository.save(session);

        // Update user's total study time (duration is in seconds, convert to minutes)
        int durationMinutes = request.getDuration() / 60;
        if (durationMinutes > 0) {
            user.setTotalStudyMinutes(user.getTotalStudyMinutes() + durationMinutes);
            userRepository.save(user);
        }

        // Update quests based on activity type
        switch (request.getActivityType()) {
            case "FOCUS":
                userService.updateQuestProgress(userId, "FOCUS", 1);
                break;
            case "QUIZ":
            case "FLASHCARD":
            case "MEMORY":
                userService.updateQuestProgress(userId, "REVIEW", 1);

                // Check for quiz challenge (100% score)
                if (request.getScore() != null && request.getMaxScore() != null
                        && request.getScore().equals(request.getMaxScore())) {
                    userService.updateChallengeProgress(userId, "QUIZ_STREAK", 1);
                }
                break;
        }

        return StudySessionDto.fromEntity(session);
    }

    public Map<String, Object> getAnalytics(Long userId) {
        Map<String, Object> analytics = new HashMap<>();

        // Total study time
        Long totalTime = sessionRepository.getTotalStudyTime(userId);
        analytics.put("totalStudyTime", totalTime != null ? totalTime : 0);

        // Study time by subject
        List<Object[]> bySubject = sessionRepository.getStudyTimeBySubject(userId);
        Map<String, Long> subjectTime = new HashMap<>();
        for (Object[] row : bySubject) {
            subjectTime.put((String) row[0], ((Number) row[1]).longValue());
        }
        analytics.put("studyTimeBySubject", subjectTime);

        // Recent sessions (last 7 days)
        List<StudySessionDto> recentSessions = getRecentSessions(userId, 7);
        analytics.put("recentSessions", recentSessions);
        analytics.put("sessionCount", recentSessions.size());

        return analytics;
    }
}
