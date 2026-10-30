package com.cognify.repository;

import com.cognify.entity.DailyQuest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DailyQuestRepository extends JpaRepository<DailyQuest, Long> {

    List<DailyQuest> findByUserIdAndQuestDate(Long userId, LocalDate questDate);

    List<DailyQuest> findByUserIdAndQuestDateAndCompletedFalse(Long userId, LocalDate questDate);

    void deleteByUserIdAndQuestDateBefore(Long userId, LocalDate beforeDate);
}
