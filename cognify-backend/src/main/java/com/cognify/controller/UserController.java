package com.cognify.controller;

import com.cognify.dto.*;
import com.cognify.entity.User;
import com.cognify.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Principal principal) {
        User user = userService.getCurrentUser(principal.getName());
        return ResponseEntity.ok(UserResponse.fromEntity(user));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateUser(
            Principal principal,
            @RequestBody UserResponse updates) {
        User user = userService.getCurrentUser(principal.getName());
        UserResponse response = userService.updateUser(user.getId(), updates);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/me/rewards")
    public ResponseEntity<UserResponse> addRewards(
            Principal principal,
            @RequestBody RewardRequest request) {
        User user = userService.getCurrentUser(principal.getName());
        UserResponse response = userService.addRewards(user.getId(), request.getXp(), request.getCoins());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/me/purchase")
    public ResponseEntity<UserResponse> purchaseItem(
            Principal principal,
            @RequestBody Map<String, Object> request) {
        User user = userService.getCurrentUser(principal.getName());
        String itemId = (String) request.get("itemId");
        int cost = (int) request.get("cost");
        String itemType = (String) request.get("itemType");
        String itemValue = (String) request.get("itemValue");

        UserResponse response = userService.purchaseItem(user.getId(), itemId, cost, itemType, itemValue);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/me/equip")
    public ResponseEntity<UserResponse> equipItem(
            Principal principal,
            @RequestBody Map<String, String> request) {
        User user = userService.getCurrentUser(principal.getName());
        UserResponse response = userService.equipItem(
                user.getId(),
                request.get("itemType"),
                request.get("itemValue"));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/me/trial")
    public ResponseEntity<UserResponse> activateTrial(
            Principal principal,
            @RequestBody Map<String, Object> request) {
        User user = userService.getCurrentUser(principal.getName());
        String featureId = (String) request.get("featureId");
        int hours = (int) request.get("hours");

        UserResponse response = userService.activateTrial(user.getId(), featureId, hours);
        return ResponseEntity.ok(response);
    }

    // ============== QUESTS ==============

    @GetMapping("/me/quests")
    public ResponseEntity<List<DailyQuestDto>> getQuests(Principal principal) {
        User user = userService.getCurrentUser(principal.getName());
        List<DailyQuestDto> quests = userService.getQuests(user.getId());
        return ResponseEntity.ok(quests);
    }

    @PostMapping("/me/quests/{type}/progress")
    public ResponseEntity<DailyQuestDto> updateQuestProgress(
            Principal principal,
            @PathVariable String type,
            @RequestBody(required = false) Map<String, Integer> request) {
        User user = userService.getCurrentUser(principal.getName());
        int amount = request != null && request.containsKey("amount") ? request.get("amount") : 1;
        DailyQuestDto quest = userService.updateQuestProgress(user.getId(), type, amount);
        return ResponseEntity.ok(quest);
    }

    // ============== CHALLENGES ==============

    @GetMapping("/me/challenges")
    public ResponseEntity<List<DailyChallengeDto>> getChallenges(Principal principal) {
        User user = userService.getCurrentUser(principal.getName());
        List<DailyChallengeDto> challenges = userService.getChallenges(user.getId());
        return ResponseEntity.ok(challenges);
    }

    @PostMapping("/me/challenges/{id}/activate")
    public ResponseEntity<DailyChallengeDto> activateChallenge(
            Principal principal,
            @PathVariable Long id) {
        User user = userService.getCurrentUser(principal.getName());
        try {
            DailyChallengeDto challenge = userService.activateChallenge(user.getId(), id);
            return ResponseEntity.ok(challenge);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/me/challenges/{type}/progress")
    public ResponseEntity<DailyChallengeDto> updateChallengeProgress(
            Principal principal,
            @PathVariable String type,
            @RequestBody(required = false) Map<String, Integer> request) {
        User user = userService.getCurrentUser(principal.getName());
        int value = request != null && request.containsKey("value") ? request.get("value") : 1;
        DailyChallengeDto challenge = userService.updateChallengeProgress(user.getId(), type, value);
        return ResponseEntity.ok(challenge);
    }

    @PostMapping("/me/challenges/{id}/fail")
    public ResponseEntity<DailyChallengeDto> failChallenge(
            Principal principal,
            @PathVariable Long id) {
        User user = userService.getCurrentUser(principal.getName());
        DailyChallengeDto challenge = userService.failChallenge(user.getId(), id);
        return ResponseEntity.ok(challenge);
    }
}
