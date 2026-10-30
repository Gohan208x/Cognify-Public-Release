package com.cognify.repository;

import com.cognify.entity.PlannerEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlannerEventRepository extends JpaRepository<PlannerEvent, Long> {

    List<PlannerEvent> findByUserIdOrderByDayAscTimeAsc(Long userId);

    List<PlannerEvent> findByUserIdAndDay(Long userId, String day);

    List<PlannerEvent> findByUserIdAndDayAndTimeAndCompletedFalse(Long userId, String day, String time);

    void deleteByIdAndUserId(Long id, Long userId);
}
