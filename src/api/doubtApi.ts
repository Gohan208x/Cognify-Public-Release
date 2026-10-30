/**
 * Doubt Panel API Client
 * API for channels, messages, doubts, and user presence.
 */

import apiClient from './apiClient';

// ============== TYPES ==============

export interface ChannelDto {
    id: number;
    name: string;
    type: 'ANNOUNCEMENT' | 'DOUBT' | 'GENERAL';
    description: string;
    emoji: string;
    displayOrder: number;
}

export interface ChannelMessageDto {
    id: number;
    channelId: number;
    authorId: number;
    authorUsername: string;
    authorDisplayName?: string;
    authorAvatar: string;
    authorProfilePictureUrl?: string; // Custom image URL
    authorDoubtTitle: string | null;
    authorProfileBorder: string | null;
    authorProfileTheme: string | null;
    content: string;
    imageUrl: string | null;
    replyToId: number | null;
    replyToContent: string | null;
    replyToUsername: string | null;
    createdAt: string;
}

export interface DoubtDto {
    id: number;
    authorId: number;
    authorUsername: string;
    authorDisplayName?: string;
    authorAvatar: string;
    authorProfilePictureUrl?: string; // Custom image URL
    authorProfileBorder: string | null;
    authorProfileTheme: string | null;
    question: string;
    imageUrl: string | null;
    course: string;
    status: 'OPEN' | 'SOLVED';
    solverId: number | null;
    solverUsername: string | null;
    solverDisplayName?: string;
    solverAvatar: string | null;
    solverProfilePictureUrl?: string; // Custom image URL
    solverDoubtTitle: string | null;
    coinsRewarded: number | null;
    createdAt: string;
    solvedAt: string | null;
    solutions: DoubtSolutionDto[];
}

export interface DoubtSolutionDto {
    id: number;
    doubtId: number;
    solverId: number;
    solverUsername: string;
    solverDisplayName?: string;
    solverAvatar: string;
    solverProfilePictureUrl?: string; // Custom image URL
    solverDoubtTitle: string | null;
    solverProfileBorder: string | null;
    solverProfileTheme: string | null;
    explanation: string;
    imageUrl: string | null;
    likes: number;
    isAccepted: boolean;
    createdAt: string;
}

export interface UserPresenceDto {
    userId: number;
    username: string;
    displayName?: string;
    avatar: string;
    profilePictureUrl?: string; // Custom image URL
    doubtTitle: string | null;
    profileBorder: string | null;
    profileTheme: string | null;
    level: number;
    isOnline: boolean;
    lastSeen: string;
}

export interface PresenceListDto {
    onlineUsers: UserPresenceDto[];
    offlineUsers: UserPresenceDto[];
}

export interface DoubtTitleDto {
    id: string;
    name: string;
    emoji: string;
    requiredSolves: number;
    earned: boolean;
}

// ============== CHANNEL API ==============

export const channelApi = {
    getChannels: async (): Promise<ChannelDto[]> => {
        return apiClient.get<ChannelDto[]>('/channels');
    },

    getMessages: async (channelId: number, page = 0, size = 50): Promise<ChannelMessageDto[]> => {
        return apiClient.get<ChannelMessageDto[]>(`/channels/${channelId}/messages?page=${page}&size=${size}`);
    },

    getLatestMessages: async (channelId: number): Promise<ChannelMessageDto[]> => {
        return apiClient.get<ChannelMessageDto[]>(`/channels/${channelId}/messages/latest`);
    },

    postMessage: async (channelId: number, content: string, imageUrl?: string, replyToId?: number): Promise<ChannelMessageDto> => {
        return apiClient.post<ChannelMessageDto>(`/channels/${channelId}/messages`, { content, imageUrl, replyToId });
    },

    heartbeat: async (channelId?: number): Promise<void> => {
        await apiClient.post('/channels/presence/heartbeat' + (channelId ? `?channelId=${channelId}` : ''));
    },

    getPresence: async (): Promise<PresenceListDto> => {
        return apiClient.get<PresenceListDto>('/channels/presence');
    },

    /**
     * Delete a channel message (only by author or admin)
     */
    deleteMessage: async (channelId: number, messageId: number): Promise<void> => {
        return apiClient.delete(`/channels/${channelId}/messages/${messageId}`);
    }
};

// ============== DOUBT API ==============

export const doubtApi = {
    getDoubts: async (course?: string, status?: string, page = 0, size = 20): Promise<DoubtDto[]> => {
        const params = new URLSearchParams();
        if (course) params.append('course', course);
        if (status) params.append('status', status);
        params.append('page', String(page));
        params.append('size', String(size));
        return apiClient.get<DoubtDto[]>(`/doubts?${params.toString()}`);
    },

    getDoubt: async (id: number): Promise<DoubtDto> => {
        return apiClient.get<DoubtDto>(`/doubts/${id}`);
    },

    getMyDoubts: async (): Promise<DoubtDto[]> => {
        return apiClient.get<DoubtDto[]>('/doubts/my');
    },

    getMySolvedDoubts: async (): Promise<DoubtDto[]> => {
        return apiClient.get<DoubtDto[]>('/doubts/my/solved');
    },

    createDoubt: async (question: string, course: string, imageUrl?: string): Promise<DoubtDto> => {
        return apiClient.post<DoubtDto>('/doubts', { question, course, imageUrl });
    },

    submitSolution: async (doubtId: number, explanation: string, imageUrl?: string): Promise<DoubtSolutionDto> => {
        return apiClient.post<DoubtSolutionDto>(`/doubts/${doubtId}/solutions`, { explanation, imageUrl });
    },

    acceptSolution: async (doubtId: number, solutionId: number, coinsReward: number): Promise<DoubtDto> => {
        return apiClient.post<DoubtDto>(`/doubts/${doubtId}/solutions/${solutionId}/accept`, { coinsReward });
    },

    likeSolution: async (solutionId: number): Promise<DoubtSolutionDto> => {
        return apiClient.post<DoubtSolutionDto>(`/doubts/solutions/${solutionId}/like`);
    },

    getMyTitles: async (): Promise<DoubtTitleDto[]> => {
        return apiClient.get<DoubtTitleDto[]>('/doubts/titles');
    },

    equipTitle: async (titleId: string): Promise<void> => {
        await apiClient.post(`/doubts/titles/${titleId}/equip`);
    },

    /**
     * Delete a doubt (only by author, only if OPEN status)
     */
    deleteDoubt: async (doubtId: number): Promise<void> => {
        await apiClient.delete(`/doubts/${doubtId}`);
    }
};
