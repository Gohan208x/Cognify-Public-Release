/**
 * Cognify API Client
 * 
 * Centralized API communication layer for the React frontend.
 * Handles authentication, request formatting, and error handling.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

interface ApiResponse<T> {
    data?: T;
    error?: string;
}

class ApiClient {
    private getToken(): string | null {
        return localStorage.getItem('cognify_token');
    }

    private getHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    async get<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return response.json();
    }

    async post<T>(endpoint: string, data?: any): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: data ? JSON.stringify(data) : undefined,
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        // Handle empty responses (heartbeat, markAsRead, etc.)
        const contentLength = response.headers.get('content-length');
        if (response.status === 204 || contentLength === '0') {
            return undefined as T;
        }

        // Handle text responses (for Gemini endpoints)
        const contentType = response.headers.get('content-type');
        if (!contentType) {
            return undefined as T;
        }
        if (contentType.includes('text/plain')) {
            return response.text() as Promise<T>;
        }

        // Try to parse JSON, handle empty body gracefully
        const text = await response.text();
        if (!text || text.trim().length === 0) {
            return undefined as T;
        }
        return JSON.parse(text);
    }

    async put<T>(endpoint: string, data?: any): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: data ? JSON.stringify(data) : undefined,
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        // Handle empty responses
        const text = await response.text();
        if (!text || text.trim().length === 0) {
            return undefined as T;
        }
        return JSON.parse(text);
    }

    async delete(endpoint: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
    }
}

export const apiClient = new ApiClient();
export default apiClient;
