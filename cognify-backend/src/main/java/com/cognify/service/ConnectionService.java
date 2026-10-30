package com.cognify.service;

import com.cognify.dto.BlockedUserDto;
import com.cognify.dto.ConnectionDto;
import com.cognify.entity.BlockedUser;
import com.cognify.entity.Connection;
import com.cognify.entity.Connection.ConnectionStatus;
import com.cognify.entity.User;
import com.cognify.repository.BlockedUserRepository;
import com.cognify.repository.ConnectionRepository;
import com.cognify.repository.ConversationRepository;
import com.cognify.repository.MessageRepository;
import com.cognify.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ConnectionService {

    private static final Logger log = LoggerFactory.getLogger(ConnectionService.class);
    private final ConnectionRepository connectionRepository;
    private final UserRepository userRepository;
    private final BlockedUserRepository blockedUserRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;

    public ConnectionService(ConnectionRepository connectionRepository,
            UserRepository userRepository,
            BlockedUserRepository blockedUserRepository,
            ConversationRepository conversationRepository,
            MessageRepository messageRepository) {
        this.connectionRepository = connectionRepository;
        this.userRepository = userRepository;
        this.blockedUserRepository = blockedUserRepository;
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
    }

    /**
     * Send a connection request. If the recipient has already sent a request to the
     * sender,
     * auto-accept both connections.
     */
    @Transactional
    public ConnectionDto sendConnectionRequest(Long requesterId, Long recipientId) {
        if (requesterId.equals(recipientId)) {
            throw new RuntimeException("Cannot connect with yourself");
        }

        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("Requester not found"));
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new RuntimeException("Recipient not found"));

        // Check if already connected
        if (connectionRepository.areUsersConnected(requesterId, recipientId)) {
            throw new RuntimeException("Already connected");
        }

        // Check if either user has blocked the other
        if (blockedUserRepository.hasBlockBetween(requesterId, recipientId)) {
            throw new RuntimeException("Cannot send request - user is blocked or has blocked you");
        }

        // Check if there's a pending request FROM recipient TO requester (reverse
        // request)
        Optional<Connection> reverseRequest = connectionRepository.findPendingRequest(recipientId, requesterId);

        if (reverseRequest.isPresent()) {
            // Auto-accept! Both users want to connect
            Connection existingRequest = reverseRequest.get();
            existingRequest.accept();
            connectionRepository.save(existingRequest);
            log.info("Auto-accepted mutual connection between {} and {}", requester.getUsername(),
                    recipient.getUsername());
            return ConnectionDto.fromEntity(existingRequest, requesterId);
        }

        // Check if already sent a request
        Optional<Connection> existingRequest = connectionRepository.findPendingRequest(requesterId, recipientId);
        if (existingRequest.isPresent()) {
            throw new RuntimeException("Connection request already sent");
        }

        // Create new connection request
        Connection connection = new Connection(requester, recipient);
        connectionRepository.save(connection);
        log.info("Connection request sent from {} to {}", requester.getUsername(), recipient.getUsername());

        return ConnectionDto.fromEntity(connection, requesterId);
    }

    /**
     * Accept a connection request
     */
    @Transactional
    public ConnectionDto acceptRequest(Long connectionId, Long userId) {
        Connection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new RuntimeException("Connection request not found"));

        if (!connection.getRecipient().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to accept this request");
        }

        if (connection.getStatus() != ConnectionStatus.PENDING) {
            throw new RuntimeException("Request already processed");
        }

        connection.accept();
        connectionRepository.save(connection);
        log.info("Connection accepted between {} and {}",
                connection.getRequester().getUsername(),
                connection.getRecipient().getUsername());

        return ConnectionDto.fromEntity(connection, userId);
    }

    /**
     * Decline or cancel a connection request
     */
    @Transactional
    public void declineOrCancelRequest(Long connectionId, Long userId) {
        Connection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new RuntimeException("Connection request not found"));

        // Either the recipient can decline, or the requester can cancel
        boolean isRecipient = connection.getRecipient().getId().equals(userId);
        boolean isRequester = connection.getRequester().getId().equals(userId);

        if (!isRecipient && !isRequester) {
            throw new RuntimeException("Not authorized");
        }

        if (connection.getStatus() != ConnectionStatus.PENDING) {
            throw new RuntimeException("Cannot cancel accepted connection");
        }

        connectionRepository.delete(connection);
        log.info("Connection request cancelled/declined");
    }

    /**
     * Remove an existing connection
     */
    @Transactional
    public void removeConnection(Long connectionId, Long userId) {
        Connection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new RuntimeException("Connection not found"));

        boolean isParticipant = connection.getRequester().getId().equals(userId) ||
                connection.getRecipient().getId().equals(userId);

        if (!isParticipant) {
            throw new RuntimeException("Not authorized");
        }

        Long requesterId = connection.getRequester().getId();
        Long recipientId = connection.getRecipient().getId();

        // Delete conversation and messages between the two users
        conversationRepository.findConversationBetweenUsers(requesterId, recipientId)
                .ifPresent(conversation -> {
                    messageRepository.deleteByConversationId(conversation.getId());
                    conversationRepository.delete(conversation);
                    log.info("Deleted conversation {} when removing connection", conversation.getId());
                });

        connectionRepository.delete(connection);
        log.info("Connection removed");
    }

    /**
     * Remove connection by the other user's ID (instead of connection ID)
     */
    @Transactional
    public void removeConnectionByUserId(Long currentUserId, Long otherUserId) {
        Connection connection = connectionRepository.findConnectionBetweenUsers(currentUserId, otherUserId)
                .orElseThrow(() -> new RuntimeException("Connection not found"));

        // Delete conversation and messages between the two users
        conversationRepository.findConversationBetweenUsers(currentUserId, otherUserId)
                .ifPresent(conversation -> {
                    messageRepository.deleteByConversationId(conversation.getId());
                    conversationRepository.delete(conversation);
                    log.info("Deleted conversation {} when removing connection", conversation.getId());
                });

        connectionRepository.delete(connection);
        log.info("Connection removed between users {} and {}", currentUserId, otherUserId);
    }

    /**
     * Get pending requests received by the user
     */
    public List<ConnectionDto> getPendingRequests(Long userId) {
        List<Connection> requests = connectionRepository.findPendingRequestsForUser(userId);
        log.info("Found {} pending requests for user ID {}", requests.size(), userId);
        for (Connection c : requests) {
            log.info("  Request ID {} from {} (ID {}) to recipient ID {}",
                    c.getId(), c.getRequester().getUsername(), c.getRequester().getId(), c.getRecipient().getId());
        }
        return requests
                .stream()
                .map(ConnectionDto::fromEntityAsRequest)
                .collect(Collectors.toList());
    }

    /**
     * Get pending requests sent by the user
     */
    public List<ConnectionDto> getSentRequests(Long userId) {
        return connectionRepository.findPendingRequestsByUser(userId)
                .stream()
                .map(c -> ConnectionDto.fromEntity(c, userId))
                .collect(Collectors.toList());
    }

    /**
     * Get all accepted connections for a user
     */
    public List<ConnectionDto> getConnections(Long userId) {
        return connectionRepository.findAcceptedConnectionsForUser(userId)
                .stream()
                .map(c -> ConnectionDto.fromEntity(c, userId))
                .collect(Collectors.toList());
    }

    /**
     * Check if two users are connected
     */
    public boolean areConnected(Long userId1, Long userId2) {
        return connectionRepository.areUsersConnected(userId1, userId2);
    }

    /**
     * Get connection status between two users
     */
    public String getConnectionStatus(Long currentUserId, Long otherUserId) {
        Optional<Connection> connection = connectionRepository.findConnectionBetweenUsers(currentUserId, otherUserId);

        if (connection.isEmpty()) {
            return "NONE";
        }

        Connection c = connection.get();
        if (c.getStatus() == ConnectionStatus.ACCEPTED) {
            return "CONNECTED";
        }

        // It's pending - determine who sent it
        if (c.getRequester().getId().equals(currentUserId)) {
            return "PENDING_SENT";
        } else {
            return "PENDING_RECEIVED";
        }
    }

    /**
     * Get connection count for a user
     */
    public long getConnectionCount(Long userId) {
        return connectionRepository.countConnectionsForUser(userId);
    }

    // ==================== BLOCK FEATURE ====================

    /**
     * Block a user
     */
    @Transactional
    public void blockUser(Long blockerId, Long blockedId) {
        if (blockerId.equals(blockedId)) {
            throw new RuntimeException("Cannot block yourself");
        }

        User blocker = userRepository.findById(blockerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User blocked = userRepository.findById(blockedId)
                .orElseThrow(() -> new RuntimeException("User to block not found"));

        // Check if already blocked
        if (blockedUserRepository.isBlocked(blockerId, blockedId)) {
            throw new RuntimeException("User already blocked");
        }

        // Create block record
        BlockedUser block = new BlockedUser(blocker, blocked);
        blockedUserRepository.save(block);

        // Remove any existing connection between them
        connectionRepository.findAnyConnection(blockerId, blockedId)
                .ifPresent(connectionRepository::delete);

        // Delete all conversations and messages between the two users
        conversationRepository.findConversationBetweenUsers(blockerId, blockedId)
                .ifPresent(conversation -> {
                    messageRepository.deleteByConversationId(conversation.getId());
                    conversationRepository.delete(conversation);
                    log.info("Deleted conversation {} between users {} and {}", conversation.getId(), blockerId,
                            blockedId);
                });

        log.info("User {} blocked user {}", blocker.getUsername(), blocked.getUsername());
    }

    /**
     * Unblock a user
     */
    @Transactional
    public void unblockUser(Long blockerId, Long blockedId) {
        BlockedUser block = blockedUserRepository.findByBlockerAndBlocked(blockerId, blockedId)
                .orElseThrow(() -> new RuntimeException("User is not blocked"));

        blockedUserRepository.delete(block);
        log.info("User {} unblocked user {}", blockerId, blockedId);
    }

    /**
     * Get list of users blocked by the current user
     */
    public List<BlockedUserDto> getBlockedUsers(Long userId) {
        return blockedUserRepository.findByBlockerId(userId)
                .stream()
                .map(BlockedUserDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Check if currentUser has blocked otherUser
     */
    public boolean hasBlocked(Long currentUserId, Long otherUserId) {
        return blockedUserRepository.isBlocked(currentUserId, otherUserId);
    }

    /**
     * Check if otherUser has blocked currentUser
     */
    public boolean isBlockedBy(Long currentUserId, Long otherUserId) {
        return blockedUserRepository.isBlocked(otherUserId, currentUserId);
    }

    /**
     * Get block status between two users
     * Returns: "NONE", "BLOCKED_BY_ME", "BLOCKED_BY_THEM"
     */
    public String getBlockStatus(Long currentUserId, Long otherUserId) {
        if (blockedUserRepository.isBlocked(currentUserId, otherUserId)) {
            return "BLOCKED_BY_ME";
        }
        if (blockedUserRepository.isBlocked(otherUserId, currentUserId)) {
            return "BLOCKED_BY_THEM";
        }
        return "NONE";
    }
}
