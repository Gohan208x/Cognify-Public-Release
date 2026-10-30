package com.cognify.service;

import com.cognify.dto.PlannerEventDto;
import com.cognify.entity.PlannerEvent;
import com.cognify.entity.User;
import com.cognify.repository.PlannerEventRepository;
import com.cognify.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PlannerService {

    private static final Logger log = LoggerFactory.getLogger(PlannerService.class);

    private final PlannerEventRepository eventRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public PlannerService(PlannerEventRepository eventRepository, UserRepository userRepository,
            UserService userService) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    public List<PlannerEventDto> getUserEvents(Long userId) {
        return eventRepository.findByUserIdOrderByDayAscTimeAsc(userId)
                .stream()
                .map(PlannerEventDto::fromEntity)
                .toList();
    }

    @Transactional
    public PlannerEventDto createEvent(Long userId, PlannerEventDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        PlannerEvent event = new PlannerEvent();
        event.setUser(user);
        event.setTitle(request.getTitle());
        event.setDay(request.getDay());
        event.setTime(request.getTime());
        event.setSubject(request.getSubject());
        event.setCompleted(false);
        event.setRewardClaimed(false);
        event.setNotified(false);

        event = eventRepository.save(event);

        // Update PLAN quest
        userService.updateQuestProgress(userId, "PLAN", 1);

        return PlannerEventDto.fromEntity(event);
    }

    @Transactional
    public PlannerEventDto toggleEvent(Long userId, Long eventId) {
        PlannerEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        event.setCompleted(!event.getCompleted());

        // Give rewards for completing if not already claimed
        if (event.getCompleted() && !event.getRewardClaimed()) {
            event.setRewardClaimed(true);
            userService.addRewards(userId, 15, 5);
        }

        eventRepository.save(event);
        return PlannerEventDto.fromEntity(event);
    }

    @Transactional
    public void deleteEvent(Long userId, Long eventId) {
        PlannerEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        eventRepository.delete(event);
    }

    public List<PlannerEventDto> getUpcomingNotifications(Long userId, String day, String time) {
        return eventRepository.findByUserIdAndDayAndTimeAndCompletedFalse(userId, day, time)
                .stream()
                .map(PlannerEventDto::fromEntity)
                .toList();
    }
}
