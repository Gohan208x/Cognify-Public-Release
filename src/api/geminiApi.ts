/**
 * Gemini AI API Service
 * 
 * All AI generation is now handled by the backend, which includes:
 * - Automatic model rotation when quota is exhausted
 * - Fallback between gemini-2.5-flash, gemini-2.5-flash-lite, gemini-2.0-flash
 * - Graceful error handling when all models are exhausted
 */

import apiClient from './apiClient';
import { PanicContent, PanicModule } from '../../types';

export interface GeminiRequest {
    topic?: string;
    content?: string;
    pyqContent?: string;
    syllabusContext?: string;
    subjects?: string;
    userContext?: string;
    moduleTitle?: string;
    quizScore?: number;
    totalQuestions?: number;
}

export const geminiApi = {
    /**
     * Detect subject from filename
     */
    detectSubjectFromFilename: async (filename: string): Promise<string> => {
        const response = await apiClient.post<{ subject: string }>('/ai/detect-subject', { filename });
        return response.subject;
    },

    /**
     * Generate smart study notes
     */
    generateSmartNotes: async (topic: string, content: string, pyqContent: string = ""): Promise<string> => {
        const response = await apiClient.post<{ notes: string }>('/ai/notes', {
            topic,
            content,
            pyqContent
        });
        return response.notes;
    },

    /**
     * Get motivation quote
     */
    getMotivationQuote: async (): Promise<string> => {
        const response = await apiClient.get<{ quote: string }>('/ai/motivation');
        return response.quote;
    },

    /**
     * Generate flashcards from content
     */
    generateFlashcardsJSON: async (topic: string, content: string): Promise<any[]> => {
        try {
            const response = await apiClient.post<string>('/ai/flashcards', { topic, content });
            return JSON.parse(response);
        } catch (e) {
            console.error('Flashcard generation error:', e);
            return [];
        }
    },

    /**
     * Generate syllabus breakdown for panic mode
     */
    generateSyllabusBreakdown: async (courseName: string, syllabus: string): Promise<PanicModule[]> => {
        try {
            const response = await apiClient.post<string>('/ai/syllabus-breakdown', {
                topic: courseName,
                content: syllabus
            });
            const list: string[] = JSON.parse(response);
            return list.map((title, i) => ({ id: `pm_${i}`, title, status: 'pending' as const }));
        } catch (e) {
            console.error('Syllabus breakdown error:', e);
            return [{ id: 'pm_error', title: 'Full Syllabus (Auto-Generated due to error)', status: 'pending' }];
        }
    },

    /**
     * Generate panic mode content (notes, quiz, flashcards)
     */
    generatePanicContent: async (moduleTitle: string, syllabusContext: string): Promise<PanicContent | null> => {
        try {
            const response = await apiClient.post<string>('/ai/panic-content', {
                moduleTitle,
                syllabusContext
            });
            return JSON.parse(response);
        } catch (e) {
            console.error('Panic content error:', e);
            return null;
        }
    },

    /**
     * Generate module insight from quiz results
     */
    generateModuleInsight: async (moduleTitle: string, quizScore: number, totalQuestions: number): Promise<string> => {
        const response = await apiClient.post<{ insight: string }>('/ai/module-insight', {
            moduleTitle,
            quizScore,
            totalQuestions
        });
        return response.insight;
    },

    /**
     * Generate AI study schedule
     */
    generateStudySchedule: async (subjects: string, userContext: string): Promise<any[]> => {
        try {
            const response = await apiClient.post<string>('/ai/schedule', {
                subjects,
                userContext
            });
            return JSON.parse(response);
        } catch (e) {
            console.error('Schedule generation error:', e);
            return [];
        }
    },

    /**
     * Solve a doubt using AI
     * Uses the /ai/notes endpoint with a doubt-solving prompt (works on deployed backend)
     */
    solveDoubt: async (course: string, question: string, imageUrl?: string): Promise<string> => {
        // Format the topic and content to generate a solution-style response
        const topic = `Doubt Solution: ${course}`;
        const content = `STUDENT DOUBT/QUESTION:
${question}
${imageUrl ? `\n[Image attached: ${imageUrl}]` : ''}

TASK: Solve this doubt completely. Provide:
1. Brief understanding of the problem
2. Step-by-step solution or explanation  
3. Key concepts and formulas used
4. Final answer or summary

Be clear, thorough, and student-friendly.`;

        const response = await apiClient.post<{ notes: string }>('/ai/notes', {
            topic,
            content,
            pyqContent: ''
        });
        return response.notes;
    },

    /**
     * Check current model status
     */
    getModelStatus: async (): Promise<{
        currentModel: string;
        rateLimitedModels: string[];
        availableModels: string[];
    }> => {
        return apiClient.get('/ai/status');
    }
};

export default geminiApi;
