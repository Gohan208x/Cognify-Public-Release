package com.cognify.repository;

import com.cognify.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    // Find conversation between two users
    @Query("SELECT c FROM Conversation c WHERE " +
            "(c.user1.id = :userId1 AND c.user2.id = :userId2) OR " +
            "(c.user1.id = :userId2 AND c.user2.id = :userId1)")
    Optional<Conversation> findConversationBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    // Get all conversations for a user, ordered by last message
    @Query("SELECT c FROM Conversation c WHERE c.user1.id = :userId OR c.user2.id = :userId ORDER BY c.lastMessageAt DESC NULLS LAST")
    List<Conversation> findConversationsForUser(@Param("userId") Long userId);

    // Delete all conversations between two users (for block/unfriend)
    @Modifying
    @Query("DELETE FROM Conversation c WHERE " +
            "(c.user1.id = :userId1 AND c.user2.id = :userId2) OR " +
            "(c.user1.id = :userId2 AND c.user2.id = :userId1)")
    void deleteConversationsBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
}
