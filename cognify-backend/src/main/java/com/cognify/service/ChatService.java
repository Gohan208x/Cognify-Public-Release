package com.cognify.service;

import com.cognify.dto.ConversationDto;
import com.cognify.dto.MessageDto;
import com.cognify.dto.SendMessageRequest;
import com.cognify.entity.Conversation;
import com.cognify.entity.Message;
import com.cognify.entity.Message.MessageType;
import com.cognify.entity.User;
import com.cognify.repository.ConversationRepository;
import com.cognify.repository.MessageRepository;
import com.cognify.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ConnectionService connectionService;

    public ChatService(ConversationRepository conversationRepository,
            MessageRepository messageRepository,
            UserRepository userRepository,
            ConnectionService connectionService) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.connectionService = connectionService;
    }

    /**
     * Get or create a conversation between two users.
     * Only allowed if users are connected.
     */
    @Transactional
    public ConversationDto getOrCreateConversation(Long userId, Long otherUserId) {
        // Verify connection
        if (!connectionService.areConnected(userId, otherUserId)) {
            throw new RuntimeException("Cannot chat with non-connected users");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new RuntimeException("Other user not found"));

        // Find existing conversation
        Conversation conversation = conversationRepository
                .findConversationBetweenUsers(userId, otherUserId)
                .orElseGet(() -> {
                    // Create new conversation
                    Conversation newConvo = new Conversation(user, otherUser);
                    return conversationRepository.save(newConvo);
                });

        Message lastMessage = messageRepository.findLastMessage(conversation.getId());
        long unreadCount = messageRepository.countUnreadMessages(conversation.getId(), userId);
        String lastMessageContent = lastMessage != null ? lastMessage.getContent() : null;

        return ConversationDto.fromEntity(conversation, userId, lastMessageContent, unreadCount);
    }

    /**
     * Get all conversations for a user
     */
    public List<ConversationDto> getConversations(Long userId) {
        List<Conversation> conversations = conversationRepository.findConversationsForUser(userId);
        List<ConversationDto> result = new ArrayList<>();

        for (Conversation convo : conversations) {
            Message lastMessage = messageRepository.findLastMessage(convo.getId());
            long unreadCount = messageRepository.countUnreadMessages(convo.getId(), userId);
            String lastMessageContent = lastMessage != null ? lastMessage.getContent() : null;
            result.add(ConversationDto.fromEntity(convo, userId, lastMessageContent, unreadCount));
        }

        return result;
    }

    /**
     * Get messages in a conversation
     */
    @Transactional
    public List<MessageDto> getMessages(Long conversationId, Long userId, int page, int size) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        // Verify user is participant
        if (!conversation.hasParticipant(userId)) {
            throw new RuntimeException("Not authorized to view this conversation");
        }

        // Mark messages as read
        markAsRead(conversationId, userId);

        List<Message> messages = messageRepository.findMessagesByConversation(
                conversationId, PageRequest.of(page, size));

        return messages.stream()
                .map(MessageDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get all messages in a conversation (for initial load)
     */
    @Transactional
    public List<MessageDto> getAllMessages(Long conversationId, Long userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        if (!conversation.hasParticipant(userId)) {
            throw new RuntimeException("Not authorized to view this conversation");
        }

        markAsRead(conversationId, userId);

        return messageRepository.findAllMessagesByConversation(conversationId)
                .stream()
                .map(MessageDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Send a text message
     */
    @Transactional
    public MessageDto sendMessage(Long conversationId, Long senderId, SendMessageRequest request) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        if (!conversation.hasParticipant(senderId)) {
            throw new RuntimeException("Not authorized to send messages in this conversation");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        Message message = new Message(conversation, sender, request.getContent());

        // Handle reply
        if (request.getReplyToId() != null) {
            Message replyTo = messageRepository.findById(request.getReplyToId())
                    .orElse(null);
            message.setReplyTo(replyTo);
        }

        messageRepository.save(message);

        // Update conversation last message time
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        log.debug("Message sent in conversation {} by user {}", conversationId, senderId);

        return MessageDto.fromEntity(message);
    }

    /**
     * Send a file/image message
     */
    @Transactional
    public MessageDto sendFileMessage(Long conversationId, Long senderId,
            String fileUrl, String fileName,
            Long fileSize, MessageType messageType) {
        if (fileSize > MAX_FILE_SIZE) {
            throw new RuntimeException("File size exceeds 5MB limit");
        }

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        if (!conversation.hasParticipant(senderId)) {
            throw new RuntimeException("Not authorized");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setMessageType(messageType);
        message.setFileUrl(fileUrl);
        message.setFileName(fileName);
        message.setFileSize(fileSize);
        message.setContent(fileName); // Use filename as content for display

        messageRepository.save(message);

        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        return MessageDto.fromEntity(message);
    }

    /**
     * Mark messages as read
     */
    @Transactional
    public void markAsRead(Long conversationId, Long userId) {
        messageRepository.markMessagesAsRead(conversationId, userId);
    }

    /**
     * Get unread message count for a user across all conversations
     */
    public long getTotalUnreadCount(Long userId) {
        List<Conversation> conversations = conversationRepository.findConversationsForUser(userId);
        return conversations.stream()
                .mapToLong(c -> messageRepository.countUnreadMessages(c.getId(), userId))
                .sum();
    }

    /**
     * Delete a message (only by sender)
     */
    @Transactional
    public void deleteMessage(Long conversationId, Long messageId, Long userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        if (!conversation.hasParticipant(userId)) {
            throw new RuntimeException("Not authorized to access this conversation");
        }

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        // Verify message is in this conversation
        if (!message.getConversation().getId().equals(conversationId)) {
            throw new RuntimeException("Message does not belong to this conversation");
        }

        // Only sender can delete
        if (!message.getSender().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own messages");
        }

        messageRepository.delete(message);
    }
}
