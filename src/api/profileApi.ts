/**
 * Profile API Service
 */

import apiClient from './apiClient';

export interface ProfileDto {
    id: number;
    username: string;
    displayName?: string;
    bio?: string;
    college?: string;
    country?: string;
    countryVisible?: boolean;
    email?: string;
    emailVisible?: boolean;
    githubUrl?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    profilePictureUrl?: string;
    skills: string[];
    profileComplete?: boolean;
    level: number;
    xp: number;
    totalStudyMinutes: number;
    totalQuizzesTaken: number;
    averageQuizScore: number;
    avatar: string;
    title: string;
    // Design customization
    profileBorder?: string;
    profileBanner?: string;
    profileTheme?: string;
    profileBackground?: string;
    // Badge-related stats
    streak?: number;
    highestStreak?: number;
    challengesCompleted?: number;
}

export interface ProfileUpdateRequest {
    displayName?: string;
    bio?: string;
    college?: string;
    country?: string;
    countryVisible?: boolean;
    emailVisible?: boolean;
    githubUrl?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    profilePictureUrl?: string;
    skills?: string[];
    // Design customization
    avatar?: string;
    title?: string;
    profileBorder?: string;
    profileBanner?: string;
    profileTheme?: string;
    profileBackground?: string;
}

export const profileApi = {
    /**
     * Get my profile
     */
    getMyProfile: async (): Promise<ProfileDto> => {
        return apiClient.get<ProfileDto>('/profile/me');
    },

    /**
     * Get any user's profile
     */
    getProfile: async (userId: number): Promise<ProfileDto> => {
        return apiClient.get<ProfileDto>(`/profile/${userId}`);
    },

    /**
     * Update my profile
     */
    updateProfile: async (request: ProfileUpdateRequest): Promise<ProfileDto> => {
        return apiClient.put<ProfileDto>('/profile', request);
    },

    /**
     * Add a skill
     */
    addSkill: async (skill: string): Promise<ProfileDto> => {
        return apiClient.post<ProfileDto>('/profile/skills', skill);
    },

    /**
     * Remove a skill
     */
    removeSkill: async (skill: string): Promise<ProfileDto> => {
        return apiClient.delete(`/profile/skills/${encodeURIComponent(skill)}`) as Promise<any>;
    }
};

export default profileApi;
