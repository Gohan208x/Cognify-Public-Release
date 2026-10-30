/**
 * Planner API Service
 */

import apiClient from './apiClient';
import { PlannerEvent } from '../../types';

export interface PlannerEventRequest {
    title: string;
    day: string;
    time: string;
    subject: string;
}

export const plannerApi = {
    /**
     * Get all planner events
     */
    getEvents: async (): Promise<PlannerEvent[]> => {
        return apiClient.get<PlannerEvent[]>('/planner');
    },

    /**
     * Create a new event
     */
    createEvent: async (request: PlannerEventRequest): Promise<PlannerEvent> => {
        return apiClient.post<PlannerEvent>('/planner', request);
    },

    /**
     * Toggle event completion
     */
    toggleEvent: async (id: string): Promise<PlannerEvent> => {
        return apiClient.put<PlannerEvent>(`/planner/${id}/toggle`);
    },

    /**
     * Delete an event
     */
    deleteEvent: async (id: string): Promise<void> => {
        return apiClient.delete(`/planner/${id}`);
    },

    /**
     * Get events for notification check
     */
    getNotifications: async (day: string, time: string): Promise<PlannerEvent[]> => {
        return apiClient.get<PlannerEvent[]>(`/planner/notifications?day=${day}&time=${time}`);
    }
};

export default plannerApi;
