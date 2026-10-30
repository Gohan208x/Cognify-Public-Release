package com.cognify.repository;

import com.cognify.entity.Connection;
import com.cognify.entity.Connection.ConnectionStatus;
import com.cognify.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConnectionRepository extends JpaRepository<Connection, Long> {

        // Find connection between two users (in either direction)
        @Query("SELECT c FROM Connection c WHERE " +
                        "(c.requester.id = :userId1 AND c.recipient.id = :userId2) OR " +
                        "(c.requester.id = :userId2 AND c.recipient.id = :userId1)")
        Optional<Connection> findConnectionBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

        // Find pending request from one user to another
        @Query("SELECT c FROM Connection c WHERE c.requester.id = :requesterId AND c.recipient.id = :recipientId AND c.status = 'PENDING'")
        Optional<Connection> findPendingRequest(@Param("requesterId") Long requesterId,
                        @Param("recipientId") Long recipientId);

        // Get all pending requests received by a user
        @Query("SELECT c FROM Connection c WHERE c.recipient.id = :userId AND c.status = 'PENDING' ORDER BY c.createdAt DESC")
        List<Connection> findPendingRequestsForUser(@Param("userId") Long userId);

        // Get all pending requests sent by a user
        @Query("SELECT c FROM Connection c WHERE c.requester.id = :userId AND c.status = 'PENDING' ORDER BY c.createdAt DESC")
        List<Connection> findPendingRequestsByUser(@Param("userId") Long userId);

        // Get all accepted connections for a user
        @Query("SELECT c FROM Connection c WHERE (c.requester.id = :userId OR c.recipient.id = :userId) AND c.status = 'ACCEPTED' ORDER BY c.acceptedAt DESC")
        List<Connection> findAcceptedConnectionsForUser(@Param("userId") Long userId);

        // Check if two users are connected
        @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Connection c WHERE " +
                        "((c.requester.id = :userId1 AND c.recipient.id = :userId2) OR " +
                        "(c.requester.id = :userId2 AND c.recipient.id = :userId1)) AND c.status = 'ACCEPTED'")
        boolean areUsersConnected(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

        // Count connections for a user
        @Query("SELECT COUNT(c) FROM Connection c WHERE (c.requester.id = :userId OR c.recipient.id = :userId) AND c.status = 'ACCEPTED'")
        long countConnectionsForUser(@Param("userId") Long userId);

        // Find any connection between two users (any status)
        @Query("SELECT c FROM Connection c WHERE " +
                        "(c.requester.id = :userId1 AND c.recipient.id = :userId2) OR " +
                        "(c.requester.id = :userId2 AND c.recipient.id = :userId1)")
        Optional<Connection> findAnyConnection(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
}
