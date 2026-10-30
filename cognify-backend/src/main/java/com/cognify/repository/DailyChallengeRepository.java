package com.cognify.repository;

import com.cognify.entity.DailyChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DailyChallengeRepository extends JpaRepository<DailyChallenge, Long> {

    List<DailyChallenge> findByUserIdAndChallengeDate(Long userId, LocalDate challengeDate);

    List<DailyChallenge> findByUserIdAndStatus(Long userId, String status);

    void deleteByUserIdAndChallengeDateBefore(Long userId, LocalDate beforeDate);
}
