package com.cognify.dto;

import com.cognify.entity.Message;
import java.time.LocalDateTime;

public class MessageDto {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderUsername;
    private String senderAvatar;
    private String content;
    private String messageType;
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private Long replyToId;
    private String replyToContent; // Preview of replied message
    private LocalDateTime createdAt;
    private LocalDateTime readAt;

    public MessageDto() {
    }

    public static MessageDto fromEntity(Message message) {
        MessageDto dto = new MessageDto();
        dto.setId(message.getId());
        dto.setConversationId(message.getConversation().getId());
        dto.setSenderId(message.getSender().getId());
        dto.setSenderUsername(message.getSender().getUsername());
        dto.setSenderAvatar(message.getSender().getAvatar());
        dto.setContent(message.getContent());
        dto.setMessageType(message.getMessageType().name());
        dto.setFileUrl(message.getFileUrl());
        dto.setFileName(message.getFileName());
        dto.setFileSize(message.getFileSize());

        if (message.getReplyTo() != null) {
            dto.setReplyToId(message.getReplyTo().getId());
            // Truncate reply preview
            String replyContent = message.getReplyTo().getContent();
            if (replyContent != null && replyContent.length() > 100) {
                replyContent = replyContent.substring(0, 100) + "...";
            }
            dto.setReplyToContent(replyContent);
        }

        dto.setCreatedAt(message.getCreatedAt());
        dto.setReadAt(message.getReadAt());

        return dto;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getSenderUsername() {
        return senderUsername;
    }

    public void setSenderUsername(String senderUsername) {
        this.senderUsername = senderUsername;
    }

    public String getSenderAvatar() {
        return senderAvatar;
    }

    public void setSenderAvatar(String senderAvatar) {
        this.senderAvatar = senderAvatar;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getMessageType() {
        return messageType;
    }

    public void setMessageType(String messageType) {
        this.messageType = messageType;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public Long getReplyToId() {
        return replyToId;
    }

    public void setReplyToId(Long replyToId) {
        this.replyToId = replyToId;
    }

    public String getReplyToContent() {
        return replyToContent;
    }

    public void setReplyToContent(String replyToContent) {
        this.replyToContent = replyToContent;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getReadAt() {
        return readAt;
    }

    public void setReadAt(LocalDateTime readAt) {
        this.readAt = readAt;
    }
}
