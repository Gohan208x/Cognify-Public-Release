package com.cognify.repository;

import com.cognify.entity.UserPresence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserPresenceRepository extends JpaRepository<UserPresence, Long> {
    List<UserPresence> findByIsOnlineTrue();

    @Query("SELECT p FROM UserPresence p WHERE p.lastSeen < :threshold AND p.isOnline = true")
    List<UserPresence> findStaleOnlineUsers(LocalDateTime threshold);
}
