package com.cognify.dto;

import com.cognify.entity.Conversation;
import java.time.LocalDateTime;

public class ConversationDto {
    private Long id;
    private Long otherUserId;
    private String otherUsername;
    private String otherDisplayName;
    private String otherAvatar;
    private String otherProfilePictureUrl; // Custom image URL
    private String otherProfileBorder;
    private String otherProfileTheme;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private Long unreadCount;

    public ConversationDto() {
    }

    public static ConversationDto fromEntity(Conversation conversation, Long currentUserId, String lastMessage,
            Long unreadCount) {
        ConversationDto dto = new ConversationDto();
        dto.setId(conversation.getId());

        // Get the other user
        var otherUser = conversation.getOtherParticipant(currentUserId);
        if (otherUser != null) {
            dto.setOtherUserId(otherUser.getId());
            dto.setOtherUsername(otherUser.getUsername());
            dto.setOtherDisplayName(otherUser.getDisplayName());
            dto.setOtherAvatar(otherUser.getAvatar());
            dto.setOtherProfilePictureUrl(otherUser.getProfilePictureUrl());
            dto.setOtherProfileBorder(otherUser.getProfileBorder());
            dto.setOtherProfileTheme(otherUser.getProfileTheme());
        }

        dto.setLastMessage(lastMessage);
        dto.setLastMessageAt(conversation.getLastMessageAt());
        dto.setUnreadCount(unreadCount);

        return dto;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOtherUserId() {
        return otherUserId;
    }

    public void setOtherUserId(Long otherUserId) {
        this.otherUserId = otherUserId;
    }

    public String getOtherUsername() {
        return otherUsername;
    }

    public void setOtherUsername(String otherUsername) {
        this.otherUsername = otherUsername;
    }

    public String getOtherDisplayName() {
        return otherDisplayName;
    }

    public void setOtherDisplayName(String otherDisplayName) {
        this.otherDisplayName = otherDisplayName;
    }

    public String getOtherAvatar() {
        return otherAvatar;
    }

    public void setOtherAvatar(String otherAvatar) {
        this.otherAvatar = otherAvatar;
    }

    public String getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(String lastMessage) {
        this.lastMessage = lastMessage;
    }

    public LocalDateTime getLastMessageAt() {
        return lastMessageAt;
    }

    public void setLastMessageAt(LocalDateTime lastMessageAt) {
        this.lastMessageAt = lastMessageAt;
    }

    public Long getUnreadCount() {
        return unreadCount;
    }

    public void setUnreadCount(Long unreadCount) {
        this.unreadCount = unreadCount;
    }

    public String getOtherProfileBorder() {
        return otherProfileBorder;
    }

    public void setOtherProfileBorder(String otherProfileBorder) {
        this.otherProfileBorder = otherProfileBorder;
    }

    public String getOtherProfileTheme() {
        return otherProfileTheme;
    }

    public void setOtherProfileTheme(String otherProfileTheme) {
        this.otherProfileTheme = otherProfileTheme;
    }

    public String getOtherProfilePictureUrl() {
        return otherProfilePictureUrl;
    }

    public void setOtherProfilePictureUrl(String otherProfilePictureUrl) {
        this.otherProfilePictureUrl = otherProfilePictureUrl;
    }
}
