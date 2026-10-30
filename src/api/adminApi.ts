/**
 * Admin API Client
 * Provides methods for admin panel operations
 */

import { apiClient } from './apiClient';

export interface AdminUser {
    id: number;
    username: string;
    coins: number;
    xp: number;
    level: number;
    streak: number;
    badges: string;
    isAdmin: boolean;
    isOwner: boolean;
    isBanned: boolean;
    banExpiry: string | null;
    banReason: string | null;
    totalStudyMinutes: number;
    profileBorder: string;
    profileBanner: string;
}

export interface AdminCheckResponse {
    isAdmin: boolean;
    isOwner: boolean;
}

export interface AdminListItem {
    id: number;
    username: string;
    isOwner: boolean;
    level: number;
}

const BAN_REASONS = [
    "Cheating/Exploiting",
    "Inappropriate behavior",
    "Spam/Abuse",
    "Harassment",
    "Terms of Service violation",
    "Custom"
];

export const adminApi = {
    /**
     * Check if current user has admin privileges
     */
    async checkAdmin(): Promise<AdminCheckResponse> {
        return await apiClient.get<AdminCheckResponse>('/admin/check');
    },

    /**
     * Get all users
     */
    async getAllUsers(): Promise<AdminUser[]> {
        return await apiClient.get<AdminUser[]>('/admin/users');
    },

    /**
     * Get user by username
     */
    async getUserByUsername(username: string): Promise<AdminUser> {
        return await apiClient.get<AdminUser>(`/admin/users/${username}`);
    },

    /**
     * Get all admins
     */
    async getAllAdmins(): Promise<AdminListItem[]> {
        return await apiClient.get<AdminListItem[]>('/admin/admins');
    },

    /**
     * Update user data
     */
    async updateUserData(username: string, data: {
        coins?: number;
        xp?: number;
        level?: number;
        streak?: number;
    }): Promise<AdminUser> {
        return await apiClient.put<AdminUser>(`/admin/users/${username}/data`, data);
    },

    /**
     * Add badges to user
     */
    async addBadges(username: string, badges: string): Promise<AdminUser> {
        return await apiClient.post<AdminUser>(`/admin/users/${username}/badges/add`, { badges });
    },

    /**
     * Remove badges from user
     */
    async removeBadges(username: string, badges: string): Promise<AdminUser> {
        return await apiClient.post<AdminUser>(`/admin/users/${username}/badges/remove`, { badges });
    },

    /**
     * Set admin status for a user
     */
    async setAdminStatus(username: string, isAdmin: boolean): Promise<AdminUser> {
        return await apiClient.put<AdminUser>(`/admin/users/${username}/admin`, { isAdmin });
    },

    /**
     * Ban a user
     * @param days - number of days (null/0 = permanent)
     */
    async banUser(username: string, days: number | null, reason: string): Promise<AdminUser> {
        return await apiClient.post<AdminUser>(`/admin/users/${username}/ban`, { days, reason });
    },

    /**
     * Unban a user
     */
    async unbanUser(username: string): Promise<AdminUser> {
        return await apiClient.post<AdminUser>(`/admin/users/${username}/unban`);
    },

    /**
     * Get preset ban reasons
     */
    getBanReasons(): string[] {
        return BAN_REASONS;
    }
};

export default adminApi;
