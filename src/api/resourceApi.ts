/**
 * Resource Hub API Client
 * Fetches auto-discovered resources from the backend.
 */

import apiClient from './apiClient';

export interface VideoLink {
    url: string;
    title: string;
}

export interface SubjectDto {
    name: string;
    tags: string[];
    noteFiles: string[];
    pyqFiles: string[];
    youtubeLinks: VideoLink[];
}

export interface ResourcesResponse {
    availableCourses: string[];
    subjects: SubjectDto[];
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const resourceApi = {
    /**
     * Get all resources including available course filters and subjects.
     */
    getAllResources: async (): Promise<ResourcesResponse> => {
        return apiClient.get<ResourcesResponse>('/resources');
    },

    /**
     * Get available course filters only.
     */
    getAvailableCourses: async (): Promise<string[]> => {
        return apiClient.get<string[]>('/resources/courses');
    },

    /**
     * Get a specific subject by name.
     */
    getSubject: async (name: string): Promise<SubjectDto> => {
        return apiClient.get<SubjectDto>(`/resources/subject/${encodeURIComponent(name)}`);
    },

    /**
     * Get the URL for a resource file.
     * @param subject - Subject name (e.g., "Java")
     * @param folder - Folder name ("Notes" or "PYQ")
     * @param filename - File name (e.g., "Java.pdf")
     */
    getFileUrl: (subject: string, folder: string, filename: string): string => {
        return `${API_BASE_URL}/resources/file/${encodeURIComponent(subject)}/${encodeURIComponent(folder)}/${encodeURIComponent(filename)}`;
    }
};
