package com.cognify.repository;

import com.cognify.entity.StudySession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StudySessionRepository extends JpaRepository<StudySession, Long> {

    List<StudySession> findByUserIdOrderByTimestampDesc(Long userId);

    List<StudySession> findByUserIdAndTimestampAfter(Long userId, LocalDateTime after);

    @Query("SELECT s FROM StudySession s WHERE s.user.id = :userId AND s.timestamp >= :startDate ORDER BY s.timestamp DESC")
    List<StudySession> findRecentSessions(Long userId, LocalDateTime startDate);

    @Query("SELECT COALESCE(SUM(COALESCE(s.duration, 0)), 0) FROM StudySession s WHERE s.user.id = :userId")
    Long getTotalStudyTime(Long userId);

    @Query("SELECT s.subject, SUM(s.duration) FROM StudySession s WHERE s.user.id = :userId GROUP BY s.subject")
    List<Object[]> getStudyTimeBySubject(Long userId);
}
