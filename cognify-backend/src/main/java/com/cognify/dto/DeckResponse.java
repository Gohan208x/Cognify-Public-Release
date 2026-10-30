package com.cognify.dto;

import com.cognify.entity.Deck;
import java.util.List;
import java.util.stream.Collectors;

public class DeckResponse {
    private String id;
    private String topic;
    private List<FlashcardDto> cards;
    private String createdAt;
    private int bestScore;

    public DeckResponse() {
    }

    public DeckResponse(String id, String topic, List<FlashcardDto> cards, String createdAt, int bestScore) {
        this.id = id;
        this.topic = topic;
        this.cards = cards;
        this.createdAt = createdAt;
        this.bestScore = bestScore;
    }

    public static DeckResponse fromEntity(Deck deck) {
        return new DeckResponse(
                deck.getId().toString(),
                deck.getTopic(),
                deck.getCards().stream()
                        .map(FlashcardDto::fromEntity)
                        .collect(Collectors.toList()),
                deck.getCreatedAt().toString(),
                deck.getBestScore());
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public List<FlashcardDto> getCards() {
        return cards;
    }

    public void setCards(List<FlashcardDto> cards) {
        this.cards = cards;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public int getBestScore() {
        return bestScore;
    }

    public void setBestScore(int bestScore) {
        this.bestScore = bestScore;
    }
}
