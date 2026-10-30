package com.cognify.service;

import com.cognify.dto.*;
import com.cognify.entity.User;
import com.cognify.repository.StudySessionRepository;
import com.cognify.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProfileService {

    private static final Logger log = LoggerFactory.getLogger(ProfileService.class);
    private final UserRepository userRepository;
    private final ConnectionService connectionService;
    private final StudySessionRepository studySessionRepository;

    public ProfileService(UserRepository userRepository, @Lazy ConnectionService connectionService,
            StudySessionRepository studySessionRepository) {
        this.userRepository = userRepository;
        this.connectionService = connectionService;
        this.studySessionRepository = studySessionRepository;
    }

    public ProfileDto getProfile(Long userId, Long viewerId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        boolean isOwnProfile = userId.equals(viewerId);
        ProfileDto dto = ProfileDto.fromEntity(user, isOwnProfile);

        // Calculate totalStudyMinutes dynamically from study sessions
        Long totalTime = studySessionRepository.getTotalStudyTime(userId);
        if (totalTime != null) {
            // Duration stored in seconds, convert to minutes
            dto.setTotalStudyMinutes((int) (totalTime / 60));
        }

        return dto;
    }

    @Transactional
    public ProfileDto updateProfile(Long userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getDisplayName() != null) {
            user.setDisplayName(request.getDisplayName());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getCollege() != null) {
            user.setCollege(request.getCollege());
        }
        if (request.getCountry() != null) {
            user.setCountry(request.getCountry());
        }
        if (request.getCountryVisible() != null) {
            user.setCountryVisible(request.getCountryVisible());
        }
        if (request.getEmailVisible() != null) {
            user.setEmailVisible(request.getEmailVisible());
        }
        if (request.getGithubUrl() != null) {
            user.setGithubUrl(request.getGithubUrl());
        }
        if (request.getLinkedinUrl() != null) {
            user.setLinkedinUrl(request.getLinkedinUrl());
        }
        if (request.getPortfolioUrl() != null) {
            user.setPortfolioUrl(request.getPortfolioUrl());
        }
        if (request.getProfilePictureUrl() != null) {
            user.setProfilePictureUrl(request.getProfilePictureUrl());
        }
        if (request.getSkills() != null) {
            user.setSkills(String.join(",", request.getSkills()));
        }

        // Design customization fields
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }
        if (request.getTitle() != null) {
            user.setTitle(request.getTitle());
        }
        if (request.getProfileBorder() != null) {
            user.setProfileBorder(request.getProfileBorder());
        }
        if (request.getProfileBanner() != null) {
            user.setProfileBanner(request.getProfileBanner());
        }
        if (request.getProfileTheme() != null) {
            user.setProfileTheme(request.getProfileTheme());
        }
        if (request.getProfileBackground() != null) {
            user.setProfileBackground(request.getProfileBackground());
        }

        // Check if profile is complete
        boolean isComplete = user.getDisplayName() != null && !user.getDisplayName().isEmpty();
        user.setProfileComplete(isComplete);

        userRepository.save(user);
        log.info("Updated profile for user: {}", user.getUsername());

        return ProfileDto.fromEntity(user, true);
    }

    @Transactional
    public ProfileDto addSkill(Long userId, String skill) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.addSkill(skill);
        userRepository.save(user);
        return ProfileDto.fromEntity(user, true);
    }

    @Transactional
    public ProfileDto removeSkill(Long userId, String skill) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.removeSkill(skill);
        userRepository.save(user);
        return ProfileDto.fromEntity(user, true);
    }

    public List<UserSearchResult> searchUsers(String query, Long currentUserId, int limit) {
        List<User> users = userRepository.searchUsers(query, PageRequest.of(0, limit));
        return users.stream()
                .filter(u -> !u.getId().equals(currentUserId))
                .map(u -> {
                    String status = connectionService.getConnectionStatus(currentUserId, u.getId());
                    return UserSearchResult.fromEntity(u, status);
                })
                .collect(Collectors.toList());
    }

    public List<UserSearchResult> getTopActiveUsers(Long currentUserId, int limit) {
        List<User> users = userRepository.findTopActiveUsers(PageRequest.of(0, limit));
        return users.stream()
                .map(u -> {
                    String status = u.getId().equals(currentUserId) ? "SELF"
                            : connectionService.getConnectionStatus(currentUserId, u.getId());
                    return UserSearchResult.fromEntity(u, status);
                })
                .collect(Collectors.toList());
    }

    public List<UserSearchResult> getTopScorers(Long currentUserId, int limit) {
        List<User> users = userRepository.findTopScorers(PageRequest.of(0, limit));
        return users.stream()
                .map(u -> {
                    String status = u.getId().equals(currentUserId) ? "SELF"
                            : connectionService.getConnectionStatus(currentUserId, u.getId());
                    return UserSearchResult.fromEntity(u, status);
                })
                .collect(Collectors.toList());
    }

    public List<UserSearchResult> getLeaderboard(Long currentUserId, int limit) {
        List<User> users = userRepository.findTopByLevelAndXp(PageRequest.of(0, limit));
        return users.stream()
                .map(u -> {
                    String status = u.getId().equals(currentUserId) ? "SELF"
                            : connectionService.getConnectionStatus(currentUserId, u.getId());
                    return UserSearchResult.fromEntity(u, status);
                })
                .collect(Collectors.toList());
    }

    public List<UserSearchResult> searchUsersBySkill(String skillsQuery, Long currentUserId, int limit) {
        // Parse comma-separated skills, trim, and convert to lowercase
        String[] searchSkillsRaw = skillsQuery.split(",");
        String[] searchSkills = new String[searchSkillsRaw.length];
        for (int i = 0; i < searchSkillsRaw.length; i++) {
            searchSkills[i] = searchSkillsRaw[i].trim().toLowerCase();
        }

        // Get all users and filter by skills in Java for reliable multi-skill matching
        List<User> allUsers = userRepository.findAll();

        List<User> matchingUsers = allUsers.stream()
                .filter(user -> {
                    String userSkills = user.getSkills();
                    if (userSkills == null || userSkills.trim().isEmpty())
                        return false;
                    String lowerUserSkills = userSkills.toLowerCase();

                    // Check if user has ALL searched skills
                    for (String skill : searchSkills) {
                        if (skill.isEmpty())
                            continue;
                        if (!lowerUserSkills.contains(skill)) {
                            return false;
                        }
                    }
                    return true;
                })
                .limit(limit)
                .collect(Collectors.toList());

        // Map to DTOs with connection status
        return matchingUsers.stream()
                .map(u -> {
                    String status = u.getId().equals(currentUserId) ? "SELF"
                            : connectionService.getConnectionStatus(currentUserId, u.getId());
                    return UserSearchResult.fromEntity(u, status);
                })
                .collect(Collectors.toList());
    }
}
