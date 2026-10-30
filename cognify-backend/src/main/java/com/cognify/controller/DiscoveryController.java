package com.cognify.controller;

import com.cognify.dto.UserSearchResult;
import com.cognify.entity.User;
import com.cognify.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class DiscoveryController {

    private final ProfileService profileService;
    private final com.cognify.repository.UserRepository userRepository;

    public DiscoveryController(ProfileService profileService,
            com.cognify.repository.UserRepository userRepository) {
        this.profileService = profileService;
        this.userRepository = userRepository;
    }

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserSearchResult>> searchUsers(
            @RequestParam String q,
            @RequestParam(defaultValue = "20") int limit,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(profileService.searchUsers(q, userId, limit));
    }

    @GetMapping("/top-active")
    public ResponseEntity<List<UserSearchResult>> getTopActiveUsers(
            @RequestParam(defaultValue = "10") int limit,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(profileService.getTopActiveUsers(userId, limit));
    }

    @GetMapping("/top-scorers")
    public ResponseEntity<List<UserSearchResult>> getTopScorers(
            @RequestParam(defaultValue = "10") int limit,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(profileService.getTopScorers(userId, limit));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<UserSearchResult>> getLeaderboard(
            @RequestParam(defaultValue = "20") int limit,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(profileService.getLeaderboard(userId, limit));
    }

    @GetMapping("/search-by-skill")
    public ResponseEntity<List<UserSearchResult>> searchUsersBySkill(
            @RequestParam String skill,
            @RequestParam(defaultValue = "20") int limit,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(profileService.searchUsersBySkill(skill, userId, limit));
    }
}
