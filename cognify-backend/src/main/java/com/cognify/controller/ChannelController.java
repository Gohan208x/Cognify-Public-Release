package com.cognify.controller;

import com.cognify.dto.DoubtPanelDto.*;
import com.cognify.entity.User;
import com.cognify.repository.UserRepository;
import com.cognify.service.ChannelService;
import com.cognify.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for channel operations.
 */
@RestController
@RequestMapping("/api/channels")
public class ChannelController {

    @Autowired
    private ChannelService channelService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get all channels.
     */
    @GetMapping
    public ResponseEntity<List<ChannelDto>> getAllChannels() {
        // Initialize default channels if needed
        channelService.initializeChannels();
        return ResponseEntity.ok(channelService.getAllChannels());
    }

    /**
     * Get messages for a channel (with pagination).
     */
    @GetMapping("/{channelId}/messages")
    public ResponseEntity<List<ChannelMessageDto>> getMessages(
            @PathVariable Long channelId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(channelService.getChannelMessages(channelId, page, size));
    }

    /**
     * Get latest messages for a channel (no pagination, for initial load).
     */
    @GetMapping("/{channelId}/messages/latest")
    public ResponseEntity<List<ChannelMessageDto>> getLatestMessages(@PathVariable Long channelId) {
        return ResponseEntity.ok(channelService.getLatestMessages(channelId));
    }

    /**
     * Post a message to a channel.
     */
    @PostMapping("/{channelId}/messages")
    public ResponseEntity<ChannelMessageDto> postMessage(
            @PathVariable Long channelId,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody SendMessageRequest request) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(channelService.postMessage(channelId, userId, request));
    }

    /**
     * Update user presence (heartbeat).
     */
    @PostMapping("/presence/heartbeat")
    public ResponseEntity<Void> heartbeat(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) Long channelId) {
        Long userId = extractUserId(authHeader);
        channelService.updatePresence(userId, channelId);
        return ResponseEntity.ok().build();
    }

    /**
     * Get online/offline user list.
     */
    @GetMapping("/presence")
    public ResponseEntity<PresenceListDto> getPresence() {
        return ResponseEntity.ok(channelService.getPresenceList());
    }

    /**
     * Delete a channel message (author or admin only).
     */
    @DeleteMapping("/{channelId}/messages/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable Long channelId,
            @PathVariable Long messageId,
            @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        channelService.deleteMessage(channelId, messageId, userId);
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
