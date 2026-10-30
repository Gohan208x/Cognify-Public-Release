package com.cognify.controller;

import com.cognify.dto.*;
import com.cognify.entity.User;
import com.cognify.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;
    private final com.cognify.repository.UserRepository userRepository;

    public ProfileController(ProfileService profileService,
            com.cognify.repository.UserRepository userRepository) {
        this.profileService = profileService;
        this.userRepository = userRepository;
    }

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    @GetMapping("/me")
    public ResponseEntity<ProfileDto> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(profileService.getProfile(userId, userId));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ProfileDto> getProfile(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long viewerId = getUserId(userDetails);
        return ResponseEntity.ok(profileService.getProfile(userId, viewerId));
    }

    @PutMapping
    public ResponseEntity<ProfileDto> updateProfile(
            @RequestBody ProfileUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(profileService.updateProfile(userId, request));
    }

    @PostMapping("/skills")
    public ResponseEntity<ProfileDto> addSkill(
            @RequestBody String skill,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(profileService.addSkill(userId, skill.replace("\"", "")));
    }

    @DeleteMapping("/skills/{skill}")
    public ResponseEntity<ProfileDto> removeSkill(
            @PathVariable String skill,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(profileService.removeSkill(userId, skill));
    }
}
