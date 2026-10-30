package com.cognify.controller;

import com.cognify.dto.DoubtPanelDto.*;
import com.cognify.entity.User;
import com.cognify.repository.UserRepository;
import com.cognify.service.DoubtService;
import com.cognify.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for doubt operations.
 */
@RestController
@RequestMapping("/api/doubts")
public class DoubtController {

    @Autowired
    private DoubtService doubtService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get doubts with optional filtering.
     */
    @GetMapping
    public ResponseEntity<List<DoubtDto>> getDoubts(
            @RequestParam(required = false) String course,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(doubtService.getDoubts(course, status, page, size));
    }

    /**
     * Get a single doubt by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<DoubtDto> getDoubt(@PathVariable Long id) {
        return ResponseEntity.ok(doubtService.getDoubt(id));
    }

    /**
     * Get current user's doubts.
     */
    @GetMapping("/my")
    public ResponseEntity<List<DoubtDto>> getMyDoubts(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(doubtService.getMyDoubts(userId));
    }

    /**
     * Get doubts solved by current user.
     */
    @GetMapping("/my/solved")
    public ResponseEntity<List<DoubtDto>> getMySolvedDoubts(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(doubtService.getMySolvedDoubts(userId));
    }

    /**
     * Create a new doubt.
     */
    @PostMapping
    public ResponseEntity<DoubtDto> createDoubt(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody CreateDoubtRequest request) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(doubtService.createDoubt(userId, request));
    }

    /**
     * Delete a doubt (only by author, only if OPEN).
     */
    @DeleteMapping("/{doubtId}")
    public ResponseEntity<Void> deleteDoubt(
            @PathVariable Long doubtId,
            @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        doubtService.deleteDoubt(doubtId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Submit a solution to a doubt.
     */
    @PostMapping("/{doubtId}/solutions")
    public ResponseEntity<DoubtSolutionDto> submitSolution(
            @PathVariable Long doubtId,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody SubmitSolutionRequest request) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(doubtService.submitSolution(doubtId, userId, request));
    }

    /**
     * Accept a solution (by doubt author).
     */
    @PostMapping("/{doubtId}/solutions/{solutionId}/accept")
    public ResponseEntity<DoubtDto> acceptSolution(
            @PathVariable Long doubtId,
            @PathVariable Long solutionId,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody AcceptSolutionRequest request) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(doubtService.acceptSolution(doubtId, solutionId, userId, request));
    }

    /**
     * Like a solution.
     */
    @PostMapping("/solutions/{solutionId}/like")
    public ResponseEntity<DoubtSolutionDto> likeSolution(
            @PathVariable Long solutionId,
            @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(doubtService.likeSolution(solutionId, userId));
    }

    /**
     * Get current user's doubt solver titles.
     */
    @GetMapping("/titles")
    public ResponseEntity<List<DoubtTitleDto>> getMyTitles(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(doubtService.getUserTitles(userId));
    }

    /**
     * Equip a doubt solver title.
     */
    @PostMapping("/titles/{titleId}/equip")
    public ResponseEntity<Void> equipTitle(
            @PathVariable String titleId,
            @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        doubtService.equipTitle(userId, titleId);
        return ResponseEntity.ok().build();
    }

    private Long extractUserId(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String username = jwtService.extractUsername(token);
        // Look up user by username to get ID
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return user.getId();
    }
}
