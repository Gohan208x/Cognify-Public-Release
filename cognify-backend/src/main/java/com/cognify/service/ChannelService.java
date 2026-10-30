package com.cognify.service;

import com.cognify.dto.DoubtPanelDto.*;
import com.cognify.entity.*;
import com.cognify.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for channel operations including messages.
 */
@Service
public class ChannelService {

    @org.springframework.beans.factory.annotation.Value("${app.owner.username:ShivamTanwar}")
    private String adminUsername;

    @Autowired
    private ChannelRepository channelRepository;

    @Autowired
    private ChannelMessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserPresenceRepository presenceRepository;

    @Autowired
    private UserService userService;

    /**
     * Get all channels ordered by display order.
     */
    public List<ChannelDto> getAllChannels() {
        return channelRepository.findAllByOrderByDisplayOrderAsc().stream()
                .map(this::toChannelDto)
                .collect(Collectors.toList());
    }

    /**
     * Get messages for a channel (paginated).
     */
    public List<ChannelMessageDto> getChannelMessages(Long channelId, int page, int size) {
        return messageRepository.findByChannelIdOrderByCreatedAtDesc(channelId, PageRequest.of(page, size))
                .stream()
                .map(this::toMessageDto)
                .collect(Collectors.toList());
    }

    /**
     * Get latest 50 messages for a channel.
     */
    public List<ChannelMessageDto> getLatestMessages(Long channelId) {
        return messageRepository.findTop50ByChannelIdOrderByCreatedAtDesc(channelId).stream()
                .map(this::toMessageDto)
                .collect(Collectors.toList());
    }

    /**
     * Post a message to a channel.
     */
    @Transactional
    public ChannelMessageDto postMessage(Long channelId, Long userId, SendMessageRequest request) {
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new RuntimeException("Channel not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if announcement channel - only admins can post
        if ("ANNOUNCEMENT".equals(channel.getType())) {
            if (!Boolean.TRUE.equals(user.getIsAdmin())) {
                throw new RuntimeException("Only admins can post in announcements");
            }
        }

        ChannelMessage message = new ChannelMessage();
        message.setChannelId(channelId);
        message.setAuthorId(userId);
        message.setContent(request.content());
        message.setImageUrl(request.imageUrl());
        message.setReplyToId(request.replyToId());

        message = messageRepository.save(message);

        // Update user presence
        updatePresence(userId, channelId);

        // Award XP for every 10 messages in General chat
        if ("GENERAL".equals(channel.getType())) {
            long messageCount = messageRepository.countByAuthorId(userId);
            if (messageCount % 10 == 0) {
                userService.addRewards(userId, 5, 2); // 5 XP, 2 coins for every 10 messages
            }
        }

        return toMessageDto(message);
    }

    /**
     * Initialize default channels if they don't exist.
     */
    @Transactional
    public void initializeChannels() {
        if (channelRepository.count() == 0) {
            Channel announcements = new Channel();
            announcements.setName("Announcements");
            announcements.setType("ANNOUNCEMENT");
            announcements.setDescription("Official announcements from the admin");
            announcements.setEmoji("📢");
            announcements.setDisplayOrder(1);
            channelRepository.save(announcements);

            Channel doubts = new Channel();
            doubts.setName("Doubt Solving");
            doubts.setType("DOUBT");
            doubts.setDescription("Ask and solve doubts with the community");
            doubts.setEmoji("❓");
            doubts.setDisplayOrder(2);
            channelRepository.save(doubts);

            Channel general = new Channel();
            general.setName("General Chat");
            general.setType("GENERAL");
            general.setDescription("Casual chat with fellow students");
            general.setEmoji("💬");
            general.setDisplayOrder(3);
            channelRepository.save(general);
        }
    }

    /**
     * Delete a channel message (author or admin only).
     */
    @Transactional
    public void deleteMessage(Long channelId, Long messageId, Long userId) {
        ChannelMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        // Verify message belongs to the channel
        if (!message.getChannelId().equals(channelId)) {
            throw new RuntimeException("Message does not belong to this channel");
        }

        // Get user to check if admin
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Only author or admin can delete
        boolean isAdmin = Boolean.TRUE.equals(user.getIsAdmin()) || adminUsername != null && adminUsername.equalsIgnoreCase(user.getUsername());
        boolean isAuthor = message.getAuthorId().equals(userId);

        if (!isAdmin && !isAuthor) {
            throw new RuntimeException("You can only delete your own messages");
        }

        messageRepository.delete(message);
    }

    /**
     * Update user presence (heartbeat).
     */
    @Transactional
    public void updatePresence(Long userId, Long channelId) {
        UserPresence presence = presenceRepository.findById(userId).orElse(new UserPresence());
        presence.setUserId(userId);
        presence.setLastSeen(LocalDateTime.now());
        presence.setIsOnline(true);
        presence.setCurrentChannelId(channelId);
        presenceRepository.save(presence);
    }

    /**
     * Get online and offline users for the presence list.
     */
    public PresenceListDto getPresenceList() {
        // Mark stale users as offline (no heartbeat for 60 seconds)
        LocalDateTime threshold = LocalDateTime.now().minusSeconds(60);
        List<UserPresence> staleUsers = presenceRepository.findStaleOnlineUsers(threshold);
        staleUsers.forEach(p -> {
            p.setIsOnline(false);
            presenceRepository.save(p);
        });

        List<UserPresence> onlinePresences = presenceRepository.findByIsOnlineTrue();

        List<UserPresenceDto> online = onlinePresences.stream()
                .map(this::toPresenceDto)
                .filter(p -> p != null)
                .collect(Collectors.toList());

        // Get some recent offline users
        List<UserPresenceDto> offline = presenceRepository.findAll().stream()
                .filter(p -> !Boolean.TRUE.equals(p.getIsOnline()))
                .limit(20)
                .map(this::toPresenceDto)
                .filter(p -> p != null)
                .collect(Collectors.toList());

        return new PresenceListDto(online, offline);
    }

    // ============== MAPPING METHODS ==============

    private ChannelDto toChannelDto(Channel channel) {
        return new ChannelDto(
                channel.getId(),
                channel.getName(),
                channel.getType(),
                channel.getDescription(),
                channel.getEmoji(),
                channel.getDisplayOrder());
    }

    private ChannelMessageDto toMessageDto(ChannelMessage message) {
        User author = userRepository.findById(message.getAuthorId()).orElse(null);

        // Fetch reply-to data if present
        String replyToContent = null;
        String replyToUsername = null;
        if (message.getReplyToId() != null) {
            ChannelMessage replyTo = messageRepository.findById(message.getReplyToId()).orElse(null);
            if (replyTo != null) {
                replyToContent = replyTo.getContent();
                User replyAuthor = userRepository.findById(replyTo.getAuthorId()).orElse(null);
                replyToUsername = replyAuthor != null ? replyAuthor.getUsername() : "Unknown";
            }
        }

        return new ChannelMessageDto(
                message.getId(),
                message.getChannelId(),
                message.getAuthorId(),
                author != null ? author.getUsername() : "Unknown",
                author != null ? author.getDisplayName() : null,
                author != null ? author.getAvatar() : "👤",
                author != null ? author.getProfilePictureUrl() : null,
                author != null ? author.getDoubtTitle() : null,
                author != null ? author.getProfileBorder() : null,
                author != null ? author.getProfileTheme() : null,
                message.getContent(),
                message.getImageUrl(),
                message.getReplyToId(),
                replyToContent,
                replyToUsername,
                message.getCreatedAt());
    }

    private UserPresenceDto toPresenceDto(UserPresence presence) {
        User user = userRepository.findById(presence.getUserId()).orElse(null);
        if (user == null)
            return null;

        return new UserPresenceDto(
                user.getId(),
                user.getUsername(),
                user.getDisplayName(),
                user.getAvatar(),
                user.getProfilePictureUrl(),
                user.getDoubtTitle(),
                user.getProfileBorder(),
                user.getProfileTheme(),
                user.getLevel(),
                presence.getIsOnline(),
                presence.getLastSeen());
    }
}
