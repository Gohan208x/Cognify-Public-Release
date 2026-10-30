/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the app.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authApi, userApi, deckApi, plannerApi, sessionApi } from '../api';
import type { DeckResponse } from '../api/deckApi';
import type { PlannerEvent, StudySession, DailyQuest, DailyChallenge, Deck } from '../types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    // Auth actions
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string, securityQuestion: string, securityAnswer: string) => Promise<void>;
    logout: () => void;

    // User update
    updateUser: (updates: Partial<User>) => void;
    refreshUser: () => Promise<void>;

    // Data
    decks: Deck[];
    plannerEvents: PlannerEvent[];
    studySessions: StudySession[];
    quests: DailyQuest[];
    challenges: DailyChallenge[];

    // Data actions
    refreshDecks: () => Promise<void>;
    refreshPlanner: () => Promise<void>;
    refreshSessions: () => Promise<void>;
    refreshQuests: () => Promise<void>;
    refreshChallenges: () => Promise<void>;
    refreshAll: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [decks, setDecks] = useState<Deck[]>([]);
    const [plannerEvents, setPlannerEvents] = useState<PlannerEvent[]>([]);
    const [studySessions, setStudySessions] = useState<StudySession[]>([]);
    const [quests, setQuests] = useState<DailyQuest[]>([]);
    const [challenges, setChallenges] = useState<DailyChallenge[]>([]);

    // Convert DeckResponse to Deck format for frontend compatibility
    const convertDeckResponse = (response: DeckResponse): Deck => ({
        id: response.id,
        topic: response.topic,
        cards: response.cards.map(c => ({
            id: c.id || '',
            front: c.front,
            back: c.back,
            status: (c.status as 'new' | 'learning' | 'mastered') || 'new'
        })),
        createdAt: response.createdAt,
        bestScore: response.bestScore
    });

    // Refresh functions
    const refreshDecks = useCallback(async () => {
        if (!authApi.isAuthenticated()) return;
        try {
            const response = await deckApi.getDecks();
            setDecks(response.map(convertDeckResponse));
        } catch (e) {
            console.error('Failed to fetch decks:', e);
        }
    }, []);

    const refreshPlanner = useCallback(async () => {
        if (!authApi.isAuthenticated()) return;
        try {
            const events = await plannerApi.getEvents();
            setPlannerEvents(events);
        } catch (e) {
            console.error('Failed to fetch planner:', e);
        }
    }, []);

    const refreshSessions = useCallback(async () => {
        if (!authApi.isAuthenticated()) return;
        try {
            const sessions = await sessionApi.getSessions();
            setStudySessions(sessions);
        } catch (e) {
            console.error('Failed to fetch sessions:', e);
        }
    }, []);

    const refreshQuests = useCallback(async () => {
        if (!authApi.isAuthenticated()) return;
        try {
            const q = await userApi.getQuests();
            setQuests(q);
        } catch (e) {
            console.error('Failed to fetch quests:', e);
        }
    }, []);

    const refreshChallenges = useCallback(async () => {
        if (!authApi.isAuthenticated()) return;
        try {
            const c = await userApi.getChallenges();
            setChallenges(c);
        } catch (e) {
            console.error('Failed to fetch challenges:', e);
        }
    }, []);

    const refreshUser = useCallback(async () => {
        if (!authApi.isAuthenticated()) return;
        try {
            const userData = await authApi.getCurrentUser();
            setUser({ ...userData, isLoggedIn: true });
        } catch (e) {
            console.error('Failed to refresh user:', e);
        }
    }, []);

    const refreshAll = useCallback(async () => {
        await Promise.all([
            refreshUser(),
            refreshDecks(),
            refreshPlanner(),
            refreshSessions(),
            refreshQuests(),
            refreshChallenges()
        ]);
    }, [refreshUser, refreshDecks, refreshPlanner, refreshSessions, refreshQuests, refreshChallenges]);

    // Check for existing session on mount
    useEffect(() => {
        const initAuth = async () => {
            if (authApi.isAuthenticated()) {
                try {
                    const userData = await authApi.getCurrentUser();
                    setUser({ ...userData, isLoggedIn: true });

                    // Load all data
                    await refreshAll();
                } catch (e) {
                    // Token invalid, clear it
                    authApi.logout();
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, [refreshAll]);

    const login = async (username: string, password: string) => {
        const response = await authApi.login({ username, password });
        setUser({ ...response.user, isLoggedIn: true });
        await refreshAll();
    };

    const register = async (username: string, password: string, securityQuestion: string, securityAnswer: string) => {
        const response = await authApi.register({ username, password, securityQuestion, securityAnswer });
        setUser({ ...response.user, isLoggedIn: true });
        await refreshAll();
    };

    const logout = () => {
        authApi.logout();
        setUser(null);
        setDecks([]);
        setPlannerEvents([]);
        setStudySessions([]);
        setQuests([]);
        setChallenges([]);
    };

    const updateUser = (updates: Partial<User>) => {
        if (user) {
            setUser({ ...user, ...updates });
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            isAuthenticated: !!user,
            login,
            register,
            logout,
            updateUser,
            refreshUser,
            decks,
            plannerEvents,
            studySessions,
            quests,
            challenges,
            refreshDecks,
            refreshPlanner,
            refreshSessions,
            refreshQuests,
            refreshChallenges,
            refreshAll
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
