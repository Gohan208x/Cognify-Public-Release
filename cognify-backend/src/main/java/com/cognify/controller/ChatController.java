package com.cognify.controller;

import com.cognify.dto.*;
import com.cognify.entity.Message.MessageType;
import com.cognify.entity.User;
import com.cognify.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;
    private final com.cognify.repository.UserRepository userRepository;

    // File upload directory
    private static final String UPLOAD_DIR = "uploads/chat";
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    public ChatController(ChatService chatService,
            com.cognify.repository.UserRepository userRepository) {
        this.chatService = chatService;
        this.userRepository = userRepository;
    }

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    @GetMapping("/conversations")
    public ResponseEntity<?> getConversations(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Long userId = getUserId(userDetails);
            System.out.println("[CHAT DEBUG] getConversations - userId: " + userId);
            List<ConversationDto> result = chatService.getConversations(userId);
            System.out.println("[CHAT DEBUG] getConversations - returned " + result.size() + " conversations");
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            System.out.println("[CHAT DEBUG] getConversations ERROR: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/conversations/{otherUserId}")
    public ResponseEntity<?> getOrCreateConversation(
            @PathVariable Long otherUserId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Long userId = getUserId(userDetails);
            ConversationDto result = chatService.getOrCreateConversation(userId, otherUserId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<?> getMessages(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Long userId = getUserId(userDetails);
            List<MessageDto> messages = chatService.getMessages(conversationId, userId, page, size);
            return ResponseEntity.ok(messages);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/{conversationId}/messages/all")
    public ResponseEntity<?> getAllMessages(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Long userId = getUserId(userDetails);
            System.out
                    .println("[CHAT DEBUG] getAllMessages - conversationId: " + conversationId + ", userId: " + userId);
            List<MessageDto> messages = chatService.getAllMessages(conversationId, userId);
            System.out.println("[CHAT DEBUG] getAllMessages - returned " + messages.size() + " messages");
            return ResponseEntity.ok(messages);
        } catch (RuntimeException e) {
            System.out.println("[CHAT DEBUG] getAllMessages ERROR: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/{conversationId}/messages")
    public ResponseEntity<?> sendMessage(
            @PathVariable Long conversationId,
            @RequestBody SendMessageRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Long userId = getUserId(userDetails);
            MessageDto result = chatService.sendMessage(conversationId, userId, request);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/{conversationId}/upload")
    public ResponseEntity<?> uploadFile(
            @PathVariable Long conversationId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Long userId = getUserId(userDetails);

            // Validate file size
            if (file.getSize() > MAX_FILE_SIZE) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "File size exceeds 5MB limit");
                return ResponseEntity.badRequest().body(error);
            }

            // Determine message type
            String contentType = file.getContentType();
            MessageType messageType = MessageType.FILE;
            if (contentType != null && contentType.startsWith("image/")) {
                messageType = MessageType.IMAGE;
            }

            // Create upload directory if needed
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID().toString() + extension;

            // Save file
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath);

            // Create file URL with backend base URL
            String baseUrl = org.springframework.web.servlet.support.ServletUriComponentsBuilder
                    .fromCurrentContextPath().build().toUriString();
            String fileUrl = baseUrl + "/uploads/chat/" + uniqueFilename;

            // Create message
            MessageDto result = chatService.sendFileMessage(
                    conversationId, userId, fileUrl,
                    originalFilename, file.getSize(), messageType);

            return ResponseEntity.ok(result);

        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to upload file");
            return ResponseEntity.internalServerError().body(error);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/{conversationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        chatService.markAsRead(conversationId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        Map<String, Long> result = new HashMap<>();
        result.put("count", chatService.getTotalUnreadCount(userId));
        return ResponseEntity.ok(result);
    }

    /**
     * Delete a message (only by sender).
     */
    @DeleteMapping("/{conversationId}/messages/{messageId}")
    public ResponseEntity<?> deleteMessage(
            @PathVariable Long conversationId,
            @PathVariable Long messageId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Long userId = getUserId(userDetails);
            chatService.deleteMessage(conversationId, messageId, userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
