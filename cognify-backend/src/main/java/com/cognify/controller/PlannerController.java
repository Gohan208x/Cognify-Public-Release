package com.cognify.controller;

import com.cognify.dto.PlannerEventDto;
import com.cognify.entity.User;
import com.cognify.service.PlannerService;
import com.cognify.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/planner")
public class PlannerController {

    private final PlannerService plannerService;
    private final UserService userService;

    public PlannerController(PlannerService plannerService, UserService userService) {
        this.plannerService = plannerService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<PlannerEventDto>> getEvents(Principal principal) {
        User user = userService.getCurrentUser(principal.getName());
        List<PlannerEventDto> events = plannerService.getUserEvents(user.getId());
        return ResponseEntity.ok(events);
    }

    @PostMapping
    public ResponseEntity<PlannerEventDto> createEvent(
            Principal principal,
            @RequestBody PlannerEventDto request) {
        User user = userService.getCurrentUser(principal.getName());
        PlannerEventDto event = plannerService.createEvent(user.getId(), request);
        return ResponseEntity.ok(event);
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<PlannerEventDto> toggleEvent(
            Principal principal,
            @PathVariable Long id) {
        User user = userService.getCurrentUser(principal.getName());
        PlannerEventDto event = plannerService.toggleEvent(user.getId(), id);
        return ResponseEntity.ok(event);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(
            Principal principal,
            @PathVariable Long id) {
        User user = userService.getCurrentUser(principal.getName());
        plannerService.deleteEvent(user.getId(), id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<PlannerEventDto>> getNotifications(
            Principal principal,
            @RequestParam String day,
            @RequestParam String time) {
        User user = userService.getCurrentUser(principal.getName());
        List<PlannerEventDto> events = plannerService.getUpcomingNotifications(user.getId(), day, time);
        return ResponseEntity.ok(events);
    }
}
