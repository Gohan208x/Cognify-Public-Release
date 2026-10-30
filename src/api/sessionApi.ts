/**
 * Study Session API Service
 */

import apiClient from './apiClient';
import { StudySession } from '../../types';

export interface SessionRequest {
    duration: number;
    activityType: 'FOCUS' | 'QUIZ' | 'FLASHCARD' | 'MEMORY';
    subject: string;
    score?: number;
    maxScore?: number;
}

export interface AnalyticsResponse {
    totalStudyTime: number;
    studyTimeBySubject: Record<string, number>;
    recentSessions: StudySession[];
    sessionCount: number;
}

export const sessionApi = {
    /**
     * Get all study sessions
     */
    getSessions: async (): Promise<StudySession[]> => {
        return apiClient.get<StudySession[]>('/sessions');
    },

    /**
     * Get recent sessions
     */
    getRecentSessions: async (days: number = 7): Promise<StudySession[]> => {
        return apiClient.get<StudySession[]>(`/sessions/recent?days=${days}`);
    },

    /**
     * Track a new study session
     */
    trackSession: async (request: SessionRequest): Promise<StudySession> => {
        return apiClient.post<StudySession>('/sessions', request);
    },

    /**
     * Get analytics data
     */
    getAnalytics: async (): Promise<AnalyticsResponse> => {
        return apiClient.get<AnalyticsResponse>('/sessions/analytics');
    }
};

export default sessionApi;
