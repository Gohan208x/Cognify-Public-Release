package com.cognify.controller;

import com.cognify.dto.StudySessionDto;
import com.cognify.entity.User;
import com.cognify.service.StudySessionService;
import com.cognify.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final StudySessionService sessionService;
    private final UserService userService;

    public SessionController(StudySessionService sessionService, UserService userService) {
        this.sessionService = sessionService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<StudySessionDto>> getSessions(Principal principal) {
        User user = userService.getCurrentUser(principal.getName());
        List<StudySessionDto> sessions = sessionService.getUserSessions(user.getId());
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<StudySessionDto>> getRecentSessions(
            Principal principal,
            @RequestParam(defaultValue = "7") int days) {
        User user = userService.getCurrentUser(principal.getName());
        List<StudySessionDto> sessions = sessionService.getRecentSessions(user.getId(), days);
        return ResponseEntity.ok(sessions);
    }

    @PostMapping
    public ResponseEntity<StudySessionDto> trackSession(
            Principal principal,
            @RequestBody StudySessionDto request) {
        User user = userService.getCurrentUser(principal.getName());
        StudySessionDto session = sessionService.trackSession(user.getId(), request);
        return ResponseEntity.ok(session);
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics(Principal principal) {
        User user = userService.getCurrentUser(principal.getName());
        Map<String, Object> analytics = sessionService.getAnalytics(user.getId());
        return ResponseEntity.ok(analytics);
    }
}
