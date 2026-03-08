import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabaseClient';
import { api } from '../services/api';
import type { UserProfile, UserRole } from '../types';

interface AuthState {
    user: UserProfile | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
    signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    updateProfile: (data: Partial<UserProfile>) => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        isLoading: true,
        isAuthenticated: false,
    });

    // Check for existing session on mount
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const userData = localStorage.getItem('user_data');

        if (token && userData) {
            try {
                const user = JSON.parse(userData) as UserProfile;
                setState({
                    user,
                    token,
                    isLoading: false,
                    isAuthenticated: true,
                });
            } catch {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user_data');
                setState(s => ({ ...s, isLoading: false }));
            }
        } else {
            setState(s => ({ ...s, isLoading: false }));
        }
    }, []);

    const signUp = async (email: string, password: string, fullName: string, role: UserRole) => {
        const response: any = await api.signUp({ email, password, full_name: fullName, role });

        if (response.access_token) {
            const user: UserProfile = {
                id: response.user?.id || '',
                email,
                full_name: fullName,
                role,
            };
            localStorage.setItem('access_token', response.access_token);
            localStorage.setItem('user_data', JSON.stringify(user));
            setState({
                user,
                token: response.access_token,
                isLoading: false,
                isAuthenticated: true,
            });
        }
    };

    const signIn = async (email: string, password: string) => {
        const response: any = await api.signIn({ email, password });

        if (response.access_token) {
            const user: UserProfile = {
                id: response.user?.id || '',
                email,
                full_name: response.user?.full_name || '',
                role: (response.user?.role as UserRole) || 'patient',
            };
            localStorage.setItem('access_token', response.access_token);
            localStorage.setItem('user_data', JSON.stringify(user));
            setState({
                user,
                token: response.access_token,
                isLoading: false,
                isAuthenticated: true,
            });
        }
    };

    const signOut = async () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
        setState({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
        });
    };

    const updateProfile = async (data: Partial<UserProfile>) => {
        const updated: any = await api.updateProfile(data as Record<string, string>);
        const newUser = { ...state.user, ...updated } as UserProfile;
        localStorage.setItem('user_data', JSON.stringify(newUser));
        setState(s => ({ ...s, user: newUser }));
    };

    const refreshProfile = async () => {
        try {
            const profile: any = await api.getProfile();
            const user = profile as UserProfile;
            localStorage.setItem('user_data', JSON.stringify(user));
            setState(s => ({ ...s, user }));
        } catch {
            // Profile fetch failed, keep existing data
        }
    };

    return (
        <AuthContext.Provider
            value={{
                ...state,
                signUp,
                signIn,
                signOut,
                updateProfile,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
