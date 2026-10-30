package com.cognify.repository;

import com.cognify.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    // Search users by username (case-insensitive, partial match)
    @Query("SELECT u FROM User u WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.displayName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<User> searchUsers(@Param("query") String query, Pageable pageable);

    // Top active users (by total study minutes)
    @Query("SELECT u FROM User u WHERE u.profileComplete = true ORDER BY u.totalStudyMinutes DESC")
    List<User> findTopActiveUsers(Pageable pageable);

    // Top scorers (by average quiz score)
    @Query("SELECT u FROM User u WHERE u.profileComplete = true AND u.totalQuizzesTaken > 0 ORDER BY u.averageQuizScore DESC")
    List<User> findTopScorers(Pageable pageable);

    // Top users by level/XP
    @Query("SELECT u FROM User u ORDER BY u.level DESC, u.xp DESC")
    List<User> findTopByLevelAndXp(Pageable pageable);

    // Search users by skill (case-insensitive, partial match)
    @Query("SELECT u FROM User u WHERE LOWER(u.skills) LIKE LOWER(CONCAT('%', :skill, '%'))")
    List<User> searchUsersBySkill(@Param("skill") String skill, Pageable pageable);
}
