package com.cognify.repository;

import com.cognify.entity.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    // Get messages for a conversation (paginated, newest first)
    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId ORDER BY m.createdAt DESC")
    List<Message> findMessagesByConversation(@Param("conversationId") Long conversationId, Pageable pageable);

    // Get all messages for a conversation
    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId ORDER BY m.createdAt ASC")
    List<Message> findAllMessagesByConversation(@Param("conversationId") Long conversationId);

    // Count unread messages in a conversation for a user
    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :conversationId AND m.sender.id != :userId AND m.readAt IS NULL")
    long countUnreadMessages(@Param("conversationId") Long conversationId, @Param("userId") Long userId);

    // Mark all messages as read for a user in a conversation
    @Modifying
    @Query("UPDATE Message m SET m.readAt = CURRENT_TIMESTAMP WHERE m.conversation.id = :conversationId AND m.sender.id != :userId AND m.readAt IS NULL")
    void markMessagesAsRead(@Param("conversationId") Long conversationId, @Param("userId") Long userId);

    // Get last message in a conversation
    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId ORDER BY m.createdAt DESC LIMIT 1")
    Message findLastMessage(@Param("conversationId") Long conversationId);

    // Delete old messages (for cleanup - optional, keep last 1000 per conversation)
    @Modifying
    @Query(value = "DELETE FROM messages WHERE id NOT IN (SELECT id FROM (SELECT id FROM messages WHERE conversation_id = :conversationId ORDER BY created_at DESC LIMIT 1000) AS keep)", nativeQuery = true)
    void cleanupOldMessages(@Param("conversationId") Long conversationId);

    // Delete all messages in a conversation
    @Modifying
    @Query("DELETE FROM Message m WHERE m.conversation.id = :conversationId")
    void deleteByConversationId(@Param("conversationId") Long conversationId);
}
