/**
 * Gemini Service (Frontend Wrapper)
 * 
 * This file provides backward compatibility for components that import from here.
 * All actual API calls are now routed through the backend.
 */

import { geminiApi } from '@/src/api/geminiApi';
import { PanicContent, PanicModule } from '@/types';

export const detectSubjectFromFilename = async (filename: string): Promise<string> => {
  return geminiApi.detectSubjectFromFilename(filename);
};

export const generateSmartNotes = async (topic: string, content: string, pyqContent: string = ""): Promise<string> => {
  return geminiApi.generateSmartNotes(topic, content, pyqContent);
};

export const getMotivationQuote = async (): Promise<string> => {
  return geminiApi.getMotivationQuote();
};

export const generateFlashcardsJSON = async (topic: string, content: string): Promise<any[]> => {
  return geminiApi.generateFlashcardsJSON(topic, content);
};

export const generateSyllabusBreakdown = async (courseName: string, syllabus: string): Promise<PanicModule[]> => {
  return geminiApi.generateSyllabusBreakdown(courseName, syllabus);
};

export const generatePanicContent = async (moduleTitle: string, syllabusContext: string): Promise<PanicContent | null> => {
  return geminiApi.generatePanicContent(moduleTitle, syllabusContext);
};

export const generateModuleInsight = async (moduleTitle: string, quizScore: number, totalQuestions: number): Promise<string> => {
  return geminiApi.generateModuleInsight(moduleTitle, quizScore, totalQuestions);
};

export const generateStudySchedule = async (subjects: string, userContext: string): Promise<any[]> => {
  return geminiApi.generateStudySchedule(subjects, userContext);
};
