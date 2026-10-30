/**
 * Connection API Service
 */

import apiClient from './apiClient';

export interface ConnectionDto {
    id: number;
    userId: number;
    username: string;
    displayName?: string;
    avatar: string;
    profilePictureUrl?: string; // Custom image URL
    title: string;
    profileBorder?: string;
    profileTheme?: string;
    status: 'PENDING' | 'ACCEPTED';
    createdAt: string;
    acceptedAt?: string;
    isRequester: boolean;
}

export const connectionApi = {
    /**
     * Send a connection request
     */
    sendRequest: async (recipientId: number): Promise<ConnectionDto> => {
        return apiClient.post<ConnectionDto>(`/connections/request/${recipientId}`);
    },

    /**
     * Accept a connection request
     */
    acceptRequest: async (connectionId: number): Promise<ConnectionDto> => {
        return apiClient.post<ConnectionDto>(`/connections/accept/${connectionId}`);
    },

    /**
     * Decline or cancel a connection request
     */
    declineRequest: async (connectionId: number): Promise<void> => {
        return apiClient.delete(`/connections/request/${connectionId}`);
    },

    /**
     * Remove a connection
     */
    removeConnection: async (connectionId: number): Promise<void> => {
        return apiClient.delete(`/connections/${connectionId}`);
    },

    /**
     * Remove a connection by the other user's ID (for profile page)
     */
    removeConnectionByUserId: async (userId: number): Promise<void> => {
        return apiClient.delete(`/connections/user/${userId}`);
    },

    /**
     * Get pending requests received
     */
    getPendingRequests: async (): Promise<ConnectionDto[]> => {
        return apiClient.get<ConnectionDto[]>('/connections/requests');
    },

    /**
     * Get pending requests sent
     */
    getSentRequests: async (): Promise<ConnectionDto[]> => {
        return apiClient.get<ConnectionDto[]>('/connections/requests/sent');
    },

    /**
     * Get my connections
     */
    getConnections: async (): Promise<ConnectionDto[]> => {
        return apiClient.get<ConnectionDto[]>('/connections');
    },

    /**
     * Get connection count
     */
    getConnectionCount: async (): Promise<number> => {
        const result = await apiClient.get<{ count: number }>('/connections/count');
        return result.count;
    },

    /**
     * Get connection status with another user
     */
    getConnectionStatus: async (otherUserId: number): Promise<string> => {
        const result = await apiClient.get<{ status: string }>(`/connections/status/${otherUserId}`);
        return result.status;
    },

    /**
     * Get pending request count for badge
     */
    getPendingRequestCount: async (): Promise<number> => {
        const result = await apiClient.get<{ count: number }>('/connections/requests/count');
        return result.count;
    },

    /**
     * Get connection and block status with another user
     */
    getFullStatus: async (otherUserId: number): Promise<{ status: string; blockStatus: string }> => {
        return apiClient.get<{ status: string; blockStatus: string }>(`/connections/status/${otherUserId}`);
    },

    // ==================== BLOCK METHODS ====================

    /**
     * Block a user
     */
    blockUser: async (userId: number): Promise<void> => {
        await apiClient.post(`/connections/block/${userId}`);
    },

    /**
     * Unblock a user
     */
    unblockUser: async (userId: number): Promise<void> => {
        await apiClient.delete(`/connections/block/${userId}`);
    },

    /**
     * Get list of blocked users
     */
    getBlockedUsers: async (): Promise<BlockedUserDto[]> => {
        return apiClient.get<BlockedUserDto[]>('/connections/blocked');
    }
};

export interface BlockedUserDto {
    id: number;
    userId: number;
    username: string;
    displayName?: string;
    avatar?: string;
    blockedAt: string;
}

export default connectionApi;
