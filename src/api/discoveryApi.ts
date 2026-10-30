/**
 * Discovery API Service - User search and leaderboards
 */

import apiClient from './apiClient';

export interface UserSearchResult {
    id: number;
    username: string;
    displayName?: string;
    avatar: string;
    profilePictureUrl?: string; // Custom image URL
    title: string;
    level: number;
    college?: string;
    profileBorder?: string;
    profileTheme?: string;
    connectionStatus: 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'CONNECTED' | 'SELF';
    skills?: string[]; // User's skills for skill search feature
}

export const discoveryApi = {
    /**
     * Search users by username or display name
     */
    searchUsers: async (query: string, limit: number = 20): Promise<UserSearchResult[]> => {
        return apiClient.get<UserSearchResult[]>(`/users/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    },

    /**
     * Search users by skill (case-insensitive)
     */
    searchUsersBySkill: async (skill: string, limit: number = 20): Promise<UserSearchResult[]> => {
        return apiClient.get<UserSearchResult[]>(`/users/search-by-skill?skill=${encodeURIComponent(skill)}&limit=${limit}`);
    },

    /**
     * Get top active users
     */
    getTopActiveUsers: async (limit: number = 10): Promise<UserSearchResult[]> => {
        return apiClient.get<UserSearchResult[]>(`/users/top-active?limit=${limit}`);
    },

    /**
     * Get top scorers
     */
    getTopScorers: async (limit: number = 10): Promise<UserSearchResult[]> => {
        return apiClient.get<UserSearchResult[]>(`/users/top-scorers?limit=${limit}`);
    },

    /**
     * Get leaderboard
     */
    getLeaderboard: async (limit: number = 20): Promise<UserSearchResult[]> => {
        return apiClient.get<UserSearchResult[]>(`/users/leaderboard?limit=${limit}`);
    }
};

export default discoveryApi;

