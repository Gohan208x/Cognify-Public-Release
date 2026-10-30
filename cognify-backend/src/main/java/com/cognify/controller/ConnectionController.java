package com.cognify.controller;

import com.cognify.dto.ConnectionDto;
import com.cognify.entity.User;
import com.cognify.service.ConnectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/connections")
public class ConnectionController {

    private final ConnectionService connectionService;
    private final com.cognify.repository.UserRepository userRepository;

    public ConnectionController(ConnectionService connectionService,
            com.cognify.repository.UserRepository userRepository) {
        this.connectionService = connectionService;
        this.userRepository = userRepository;
    }

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    @PostMapping("/request/{recipientId}")
    public ResponseEntity<?> sendRequest(
            @PathVariable Long recipientId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Long userId = getUserId(userDetails);
            ConnectionDto result = connectionService.sendConnectionRequest(userId, recipientId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/accept/{connectionId}")
    public ResponseEntity<?> acceptRequest(
            @PathVariable Long connectionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Long userId = getUserId(userDetails);
            ConnectionDto result = connectionService.acceptRequest(connectionId, userId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/request/{connectionId}")
    public ResponseEntity<?> declineOrCancelRequest(
            @PathVariable Long connectionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Long userId = getUserId(userDetails);
            connectionService.declineOrCancelRequest(connectionId, userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{connectionId}")
    public ResponseEntity<?> removeConnection(
            @PathVariable Long connectionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Long userId = getUserId(userDetails);
            connectionService.removeConnection(connectionId, userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/user/{otherUserId}")
    public ResponseEntity<?> removeConnectionByUserId(
            @PathVariable Long otherUserId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Long userId = getUserId(userDetails);
            connectionService.removeConnectionByUserId(userId, otherUserId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/requests")
    public ResponseEntity<List<ConnectionDto>> getPendingRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(connectionService.getPendingRequests(userId));
    }

    @GetMapping("/requests/sent")
    public ResponseEntity<List<ConnectionDto>> getSentRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(connectionService.getSentRequests(userId));
    }

    @GetMapping
    public ResponseEntity<List<ConnectionDto>> getConnections(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(connectionService.getConnections(userId));
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getConnectionCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        Map<String, Long> result = new HashMap<>();
        result.put("count", connectionService.getConnectionCount(userId));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/requests/count")
    public ResponseEntity<Map<String, Integer>> getPendingRequestCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        Map<String, Integer> result = new HashMap<>();
        result.put("count", connectionService.getPendingRequests(userId).size());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/status/{otherUserId}")
    public ResponseEntity<Map<String, String>> getConnectionStatus(
            @PathVariable Long otherUserId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        Map<String, String> result = new HashMap<>();
        result.put("status", connectionService.getConnectionStatus(userId, otherUserId));
        result.put("blockStatus", connectionService.getBlockStatus(userId, otherUserId));
        return ResponseEntity.ok(result);
    }

    // ==================== BLOCK ENDPOINTS ====================

    @PostMapping("/block/{userId}")
    public ResponseEntity<?> blockUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Long currentUserId = getUserId(userDetails);
            connectionService.blockUser(currentUserId, userId);
            Map<String, String> result = new HashMap<>();
            result.put("message", "User blocked successfully");
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/block/{userId}")
    public ResponseEntity<?> unblockUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Long currentUserId = getUserId(userDetails);
            connectionService.unblockUser(currentUserId, userId);
            Map<String, String> result = new HashMap<>();
            result.put("message", "User unblocked successfully");
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/blocked")
    public ResponseEntity<?> getBlockedUsers(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(connectionService.getBlockedUsers(userId));
    }
}
