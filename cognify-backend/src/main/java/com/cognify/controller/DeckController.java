package com.cognify.controller;

import com.cognify.dto.*;
import com.cognify.entity.User;
import com.cognify.service.DeckService;
import com.cognify.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/decks")
public class DeckController {

    private final DeckService deckService;
    private final UserService userService;

    public DeckController(DeckService deckService, UserService userService) {
        this.deckService = deckService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<DeckResponse>> getUserDecks(Principal principal) {
        User user = userService.getCurrentUser(principal.getName());
        List<DeckResponse> decks = deckService.getUserDecks(user.getId());
        return ResponseEntity.ok(decks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeckResponse> getDeck(@PathVariable Long id) {
        DeckResponse deck = deckService.getDeck(id);
        return ResponseEntity.ok(deck);
    }

    @PostMapping
    public ResponseEntity<DeckResponse> createDeck(
            Principal principal,
            @RequestBody DeckRequest request) {
        User user = userService.getCurrentUser(principal.getName());
        DeckResponse deck = deckService.createDeck(user.getId(), request);
        return ResponseEntity.ok(deck);
    }

    @PutMapping("/{id}/score")
    public ResponseEntity<DeckResponse> updateScore(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> request) {
        int score = request.get("score");
        DeckResponse deck = deckService.updateDeckScore(id, score);
        return ResponseEntity.ok(deck);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDeck(
            Principal principal,
            @PathVariable Long id) {
        User user = userService.getCurrentUser(principal.getName());
        deckService.deleteDeck(user.getId(), id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/cards/{cardId}/status")
    public ResponseEntity<FlashcardDto> updateCardStatus(
            @PathVariable Long cardId,
            @RequestBody Map<String, String> request) {
        String status = request.get("status");
        FlashcardDto card = deckService.updateCardStatus(cardId, status);
        return ResponseEntity.ok(card);
    }
}
