package com.cognify.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTOs for the Doubt Panel feature (Channels, Messages, Doubts).
 */
public class DoubtPanelDto {

        // ============== CHANNEL DTOs ==============

        public record ChannelDto(
                        Long id,
                        String name,
                        String type,
                        String description,
                        String emoji,
                        Integer displayOrder) {
        }

        public record ChannelMessageDto(
                        Long id,
                        Long channelId,
                        Long authorId,
                        String authorUsername,
                        String authorDisplayName,
                        String authorAvatar,
                        String authorProfilePictureUrl,
                        String authorDoubtTitle,
                        String authorProfileBorder,
                        String authorProfileTheme,
                        String content,
                        String imageUrl,
                        Long replyToId,
                        String replyToContent,
                        String replyToUsername,
                        LocalDateTime createdAt) {
        }

        public record SendMessageRequest(
                        String content,
                        String imageUrl,
                        Long replyToId) {
        }

        // ============== DOUBT DTOs ==============

        public record DoubtDto(
                        Long id,
                        Long authorId,
                        String authorUsername,
                        String authorDisplayName,
                        String authorAvatar,
                        String authorProfilePictureUrl,
                        String authorProfileBorder,
                        String authorProfileTheme,
                        String question,
                        String imageUrl,
                        String course,
                        String status,
                        Long solverId,
                        String solverUsername,
                        String solverDisplayName,
                        String solverAvatar,
                        String solverProfilePictureUrl,
                        String solverDoubtTitle,
                        Integer coinsRewarded,
                        LocalDateTime createdAt,
                        LocalDateTime solvedAt,
                        List<DoubtSolutionDto> solutions) {
        }

        public record CreateDoubtRequest(
                        String question,
                        String imageUrl,
                        String course) {
        }

        public record DoubtSolutionDto(
                        Long id,
                        Long doubtId,
                        Long solverId,
                        String solverUsername,
                        String solverDisplayName,
                        String solverAvatar,
                        String solverProfilePictureUrl,
                        String solverDoubtTitle,
                        String solverProfileBorder,
                        String solverProfileTheme,
                        String explanation,
                        String imageUrl,
                        Integer likes,
                        Boolean isAccepted,
                        LocalDateTime createdAt) {
        }

        public record SubmitSolutionRequest(
                        String explanation,
                        String imageUrl) {
        }

        public record AcceptSolutionRequest(
                        Integer coinsReward) {
        }

        // ============== PRESENCE DTOs ==============

        public record UserPresenceDto(
                        Long userId,
                        String username,
                        String displayName,
                        String avatar,
                        String profilePictureUrl,
                        String doubtTitle,
                        String profileBorder,
                        String profileTheme,
                        Integer level,
                        Boolean isOnline,
                        LocalDateTime lastSeen) {
        }

        public record PresenceListDto(
                        List<UserPresenceDto> onlineUsers,
                        List<UserPresenceDto> offlineUsers) {
        }

        // ============== DOUBT TITLES ==============

        public record DoubtTitleDto(
                        String id,
                        String name,
                        String emoji,
                        Integer requiredSolves,
                        Boolean earned) {
        }

        public static final DoubtTitleDto[] DOUBT_TITLES = {
                        new DoubtTitleDto("helper_10", "Helpful Helper", "🌟", 10, false),
                        new DoubtTitleDto("mentor_25", "Study Mentor", "⭐", 25, false),
                        new DoubtTitleDto("expert_50", "Subject Expert", "🏆", 50, false),
                        new DoubtTitleDto("guru_100", "Knowledge Guru", "👑", 100, false)
        };
}
