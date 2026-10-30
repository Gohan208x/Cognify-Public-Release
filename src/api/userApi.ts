/**
 * User API Service
 */

import apiClient from './apiClient';
import { User, DailyQuest, DailyChallenge } from '../../types';

export interface RewardRequest {
    xp: number;
    coins: number;
}

export interface PurchaseRequest {
    itemId: string;
    cost: number;
    itemType: string;
    itemValue: string;
}

export interface EquipRequest {
    itemType: string;
    itemValue: string;
}

export interface TrialRequest {
    featureId: string;
    hours: number;
}

export const userApi = {
    /**
     * Get current user profile
     */
    getProfile: async (): Promise<User> => {
        return apiClient.get<User>('/users/me');
    },

    /**
     * Update user profile
     */
    updateProfile: async (updates: Partial<User>): Promise<User> => {
        return apiClient.put<User>('/users/me', updates);
    },

    /**
     * Add XP and coins
     */
    addRewards: async (xp: number, coins: number): Promise<User> => {
        return apiClient.post<User>('/users/me/rewards', { xp, coins });
    },

    /**
     * Purchase shop item
     */
    purchaseItem: async (request: PurchaseRequest): Promise<User> => {
        return apiClient.post<User>('/users/me/purchase', request);
    },

    /**
     * Equip item (avatar/title)
     */
    equipItem: async (request: EquipRequest): Promise<User> => {
        return apiClient.post<User>('/users/me/equip', request);
    },

    /**
     * Activate feature trial
     */
    activateTrial: async (featureId: string, hours: number): Promise<User> => {
        return apiClient.post<User>('/users/me/trial', { featureId, hours });
    },

    // ============== QUESTS ==============

    /**
     * Get today's quests
     */
    getQuests: async (): Promise<DailyQuest[]> => {
        return apiClient.get<DailyQuest[]>('/users/me/quests');
    },

    /**
     * Update quest progress
     */
    updateQuestProgress: async (type: string, amount: number = 1): Promise<DailyQuest> => {
        return apiClient.post<DailyQuest>(`/users/me/quests/${type}/progress`, { amount });
    },

    // ============== CHALLENGES ==============

    /**
     * Get today's challenges
     */
    getChallenges: async (): Promise<DailyChallenge[]> => {
        return apiClient.get<DailyChallenge[]>('/users/me/challenges');
    },

    /**
     * Activate a challenge (costs coins)
     */
    activateChallenge: async (id: string): Promise<DailyChallenge> => {
        return apiClient.post<DailyChallenge>(`/users/me/challenges/${id}/activate`);
    },

    /**
     * Update challenge progress
     */
    updateChallengeProgress: async (type: string, value: number = 1): Promise<DailyChallenge> => {
        return apiClient.post<DailyChallenge>(`/users/me/challenges/${type}/progress`, { value });
    },

    /**
     * Fail a challenge
     */
    failChallenge: async (id: string): Promise<DailyChallenge> => {
        return apiClient.post<DailyChallenge>(`/users/me/challenges/${id}/fail`);
    }
};

export default userApi;
