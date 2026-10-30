/**
 * Authentication API Service
 */

import apiClient from './apiClient';
import { User } from '../../types';

export interface AuthResponse {
    token: string;
    type: string;
    user: User;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    password: string;
    email?: string;
    securityQuestion: string;
    securityAnswer: string;
}

export const authApi = {
    /**
     * Register a new user
     */
    register: async (request: RegisterRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/register', request);
        if (response.token) {
            localStorage.setItem('cognify_token', response.token);
        }
        return response;
    },

    /**
     * Login existing user
     */
    login: async (request: LoginRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/login', request);
        if (response.token) {
            localStorage.setItem('cognify_token', response.token);
        }
        return response;
    },

    /**
     * Get current authenticated user
     */
    getCurrentUser: async (): Promise<User> => {
        return apiClient.get<User>('/auth/me');
    },

    /**
     * Logout - clear token
     */
    logout: () => {
        localStorage.removeItem('cognify_token');
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('cognify_token');
    },

    /**
     * Change user password
     */
    changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
        await apiClient.post('/auth/change-password', { oldPassword, newPassword });
    },

    /**
     * Get security question for a username (for forgot password)
     */
    getSecurityQuestion: async (username: string): Promise<string> => {
        const response = await apiClient.get<{ securityQuestion: string }>(`/auth/security-question/${username}`);
        return response.securityQuestion;
    },

    /**
     * Reset password using security question
     */
    forgotPassword: async (username: string, securityAnswer: string, newPassword: string): Promise<void> => {
        await apiClient.post('/auth/forgot-password', { username, securityAnswer, newPassword });
    }
};

export default authApi;
