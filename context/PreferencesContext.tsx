'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Preferences {
    theme: 'dark' | 'light';
    volume: number;
    notifications: boolean;
    autoPlayMusic: boolean;
    musicDuration: number;
}

interface PreferencesContextType {
    preferences: Preferences;
    updatePreferences: (prefs: Partial<Preferences>) => void;
    savePreferences: () => void;
}

const defaultPreferences: Preferences = {
    theme: 'dark',
    volume: 80,
    notifications: true,
    autoPlayMusic: false,
    musicDuration: 150
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
    const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load preferences from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('preferences');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setPreferences({ ...defaultPreferences, ...parsed });
            } catch (error) {
                console.error('Failed to parse preferences:', error);
            }
        }
        setIsLoaded(true);
    }, []);

    // Auto-save preferences to localStorage whenever they change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('preferences', JSON.stringify(preferences));
            // Dispatch event for cross-tab sync
            window.dispatchEvent(new Event('preferencesUpdated'));
        }
    }, [preferences, isLoaded]);

    const updatePreferences = (prefs: Partial<Preferences>) => {
        setPreferences(prev => ({ ...prev, ...prefs }));
    };

    const savePreferences = () => {
        localStorage.setItem('preferences', JSON.stringify(preferences));
        window.dispatchEvent(new Event('preferencesUpdated'));
    };

    return (
        <PreferencesContext.Provider value={{ preferences, updatePreferences, savePreferences }}>
            {children}
        </PreferencesContext.Provider>
    );
}

export function usePreferences() {
    const context = useContext(PreferencesContext);
    if (context === undefined) {
        throw new Error('usePreferences must be used within a PreferencesProvider');
    }
    return context;
}
