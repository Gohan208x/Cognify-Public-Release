package com.cognify.dto;

import java.util.List;

public class DeckRequest {
    private String topic;
    private List<FlashcardDto> cards;

    public DeckRequest() {
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
}
