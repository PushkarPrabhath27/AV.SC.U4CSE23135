'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

const ViewedContext = createContext<{
    viewed: Set<string>;
    markViewed: (id: string) => void;
}>({ viewed: new Set(), markViewed: () => {} });

export function ViewedProvider({ children }: { children: React.ReactNode }) {
    const [viewed, setViewed] = useState<Set<string>>(() => {
        if (typeof window === 'undefined') return new Set();
        try {
            const stored = localStorage.getItem('viewed_notifications');
            return stored ? new Set(JSON.parse(stored)) : new Set();
        } catch {
            return new Set();
        }
    });

    const markViewed = useCallback((id: string) => {
        setViewed((prev) => {
            const next = new Set(prev);
            next.add(id);
            try {
                localStorage.setItem('viewed_notifications', JSON.stringify([...next]));
            } catch {}
            return next;
        });
    }, []);

    return (
        <ViewedContext.Provider value={{ viewed, markViewed }}>
            {children}
        </ViewedContext.Provider>
    );
}

export function useViewed() {
    return useContext(ViewedContext);
}
