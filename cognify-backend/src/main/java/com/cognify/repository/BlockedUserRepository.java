package com.cognify.repository;

import com.cognify.entity.BlockedUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlockedUserRepository extends JpaRepository<BlockedUser, Long> {

    /**
     * Check if blocker has blocked the blocked user
     */
    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM BlockedUser b " +
            "WHERE b.blocker.id = :blockerId AND b.blocked.id = :blockedId")
    boolean isBlocked(@Param("blockerId") Long blockerId, @Param("blockedId") Long blockedId);

    /**
     * Check if either user has blocked the other (bidirectional check)
     */
    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM BlockedUser b " +
            "WHERE (b.blocker.id = :userId1 AND b.blocked.id = :userId2) " +
            "OR (b.blocker.id = :userId2 AND b.blocked.id = :userId1)")
    boolean hasBlockBetween(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    /**
     * Get all users blocked by a specific user
     */
    @Query("SELECT b FROM BlockedUser b WHERE b.blocker.id = :blockerId ORDER BY b.createdAt DESC")
    List<BlockedUser> findByBlockerId(@Param("blockerId") Long blockerId);

    /**
     * Get the block record for a specific pair
     */
    @Query("SELECT b FROM BlockedUser b WHERE b.blocker.id = :blockerId AND b.blocked.id = :blockedId")
    Optional<BlockedUser> findByBlockerAndBlocked(@Param("blockerId") Long blockerId,
            @Param("blockedId") Long blockedId);

    /**
     * Check if the blocked user is blocked by anyone (for profile view)
     */
    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM BlockedUser b " +
            "WHERE b.blocker.id = :blockerId AND b.blocked.id = :viewerId")
    boolean isBlockedByUser(@Param("blockerId") Long blockerId, @Param("viewerId") Long viewerId);
}
