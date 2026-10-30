/**
 * Chat API Service
 */

import apiClient from './apiClient';

export interface ConversationDto {
    id: number;
    otherUserId: number;
    otherUsername: string;
    otherDisplayName?: string;
    otherAvatar: string;
    otherProfilePictureUrl?: string; // Custom image URL
    otherProfileBorder?: string;
    otherProfileTheme?: string;
    lastMessage?: string;
    lastMessageAt?: string;
    unreadCount: number;
}

export interface MessageDto {
    id: number;
    conversationId: number;
    senderId: number;
    senderUsername: string;
    senderAvatar: string;
    content?: string;
    messageType: 'TEXT' | 'FILE' | 'IMAGE';
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    replyToId?: number;
    replyToContent?: string;
    createdAt: string;
    readAt?: string;
}

export interface SendMessageRequest {
    content: string;
    replyToId?: number;
}

export const chatApi = {
    /**
     * Get all conversations
     */
    getConversations: async (): Promise<ConversationDto[]> => {
        return apiClient.get<ConversationDto[]>('/chat/conversations');
    },

    /**
     * Get or create conversation with a user
     */
    getOrCreateConversation: async (otherUserId: number): Promise<ConversationDto> => {
        return apiClient.post<ConversationDto>(`/chat/conversations/${otherUserId}`);
    },

    /**
     * Get messages in a conversation
     */
    getMessages: async (conversationId: number, page: number = 0, size: number = 50): Promise<MessageDto[]> => {
        return apiClient.get<MessageDto[]>(`/chat/${conversationId}/messages?page=${page}&size=${size}`);
    },

    /**
     * Get all messages in a conversation
     */
    getAllMessages: async (conversationId: number): Promise<MessageDto[]> => {
        return apiClient.get<MessageDto[]>(`/chat/${conversationId}/messages/all`);
    },

    /**
     * Send a text message
     */
    sendMessage: async (conversationId: number, request: SendMessageRequest): Promise<MessageDto> => {
        return apiClient.post<MessageDto>(`/chat/${conversationId}/messages`, request);
    },

    /**
     * Upload a file/image
     */
    uploadFile: async (conversationId: number, file: File): Promise<MessageDto> => {
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('cognify_token');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/chat/${conversationId}/upload`, {
            method: 'POST',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to upload file');
        }

        return response.json();
    },

    /**
     * Mark messages as read
     */
    markAsRead: async (conversationId: number): Promise<void> => {
        return apiClient.post(`/chat/${conversationId}/read`);
    },

    /**
     * Get total unread count
     */
    getUnreadCount: async (): Promise<number> => {
        const result = await apiClient.get<{ count: number }>('/chat/unread-count');
        return result.count;
    },

    /**
     * Delete a message (only by sender)
     */
    deleteMessage: async (conversationId: number, messageId: number): Promise<void> => {
        return apiClient.delete(`/chat/${conversationId}/messages/${messageId}`);
    }
};

export default chatApi;
