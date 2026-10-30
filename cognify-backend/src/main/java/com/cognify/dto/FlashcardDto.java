package com.cognify.dto;

import com.cognify.entity.Flashcard;

public class FlashcardDto {
    private String id;
    private String front;
    private String back;
    private String status;

    public FlashcardDto() {
    }

    public FlashcardDto(String id, String front, String back, String status) {
        this.id = id;
        this.front = front;
        this.back = back;
        this.status = status;
    }

    public static FlashcardDto fromEntity(Flashcard card) {
        return new FlashcardDto(
                card.getId() != null ? card.getId().toString() : null,
                card.getFront(),
                card.getBack(),
                card.getStatus());
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFront() {
        return front;
    }

    public void setFront(String front) {
        this.front = front;
    }

    public String getBack() {
        return back;
    }

    public void setBack(String back) {
        this.back = back;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
