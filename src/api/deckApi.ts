/**
 * Deck API Service (Flashcards)
 */

import apiClient from './apiClient';
import { Deck, Flashcard } from '../../types';

export interface DeckRequest {
    topic: string;
    cards: { front: string; back: string; status?: string }[];
}

export interface DeckResponse {
    id: string;
    topic: string;
    cards: Flashcard[];
    createdAt: string;
    bestScore: number;
}

export const deckApi = {
    /**
     * Get all user's decks
     */
    getDecks: async (): Promise<DeckResponse[]> => {
        return apiClient.get<DeckResponse[]>('/decks');
    },

    /**
     * Get a specific deck by ID
     */
    getDeck: async (id: string): Promise<DeckResponse> => {
        return apiClient.get<DeckResponse>(`/decks/${id}`);
    },

    /**
     * Create a new deck
     */
    createDeck: async (request: DeckRequest): Promise<DeckResponse> => {
        return apiClient.post<DeckResponse>('/decks', request);
    },

    /**
     * Update deck best score
     */
    updateScore: async (id: string, score: number): Promise<DeckResponse> => {
        return apiClient.put<DeckResponse>(`/decks/${id}/score`, { score });
    },

    /**
     * Delete a deck
     */
    deleteDeck: async (id: string): Promise<void> => {
        return apiClient.delete(`/decks/${id}`);
    },

    /**
     * Update flashcard status
     */
    updateCardStatus: async (cardId: string, status: string): Promise<Flashcard> => {
        return apiClient.put<Flashcard>(`/decks/cards/${cardId}/status`, { status });
    }
};

export default deckApi;
