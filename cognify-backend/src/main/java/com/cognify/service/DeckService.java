package com.cognify.service;

import com.cognify.dto.*;
import com.cognify.entity.*;
import com.cognify.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DeckService {

    private static final Logger log = LoggerFactory.getLogger(DeckService.class);

    private final DeckRepository deckRepository;
    private final FlashcardRepository flashcardRepository;
    private final UserRepository userRepository;

    public DeckService(DeckRepository deckRepository, FlashcardRepository flashcardRepository,
            UserRepository userRepository) {
        this.deckRepository = deckRepository;
        this.flashcardRepository = flashcardRepository;
        this.userRepository = userRepository;
    }

    public List<DeckResponse> getUserDecks(Long userId) {
        return deckRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(DeckResponse::fromEntity)
                .toList();
    }

    public DeckResponse getDeck(Long deckId) {
        Deck deck = deckRepository.findByIdWithCards(deckId);
        if (deck == null) {
            throw new RuntimeException("Deck not found");
        }
        return DeckResponse.fromEntity(deck);
    }

    @Transactional
    public DeckResponse createDeck(Long userId, DeckRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Deck deck = new Deck();
        deck.setUser(user);
        deck.setTopic(request.getTopic());
        deck.setBestScore(0);
        deck.setCreatedAt(LocalDateTime.now());

        deck = deckRepository.save(deck);

        // Add flashcards
        if (request.getCards() != null) {
            for (FlashcardDto cardDto : request.getCards()) {
                Flashcard card = new Flashcard();
                card.setDeck(deck);
                card.setFront(cardDto.getFront());
                card.setBack(cardDto.getBack());
                card.setStatus("new");

                flashcardRepository.save(card);
                deck.getCards().add(card);
            }
        }

        return DeckResponse.fromEntity(deck);
    }

    @Transactional
    public DeckResponse updateDeckScore(Long deckId, int score) {
        Deck deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new RuntimeException("Deck not found"));

        if (score > deck.getBestScore()) {
            deck.setBestScore(score);
            deckRepository.save(deck);
        }

        return DeckResponse.fromEntity(deck);
    }

    @Transactional
    public void deleteDeck(Long userId, Long deckId) {
        Deck deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new RuntimeException("Deck not found"));

        if (!deck.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        deckRepository.delete(deck);
    }

    @Transactional
    public FlashcardDto updateCardStatus(Long cardId, String status) {
        Flashcard card = flashcardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));

        card.setStatus(status);
        flashcardRepository.save(card);

        return FlashcardDto.fromEntity(card);
    }
}
