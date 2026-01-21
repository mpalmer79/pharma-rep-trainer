'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Profile, ProfileWithOrganization } from '@/types/database';

// =====================================================
// AUTH CONTEXT TYPES
// =====================================================

interface AuthState {
  user: User | null;
  profile: ProfileWithOrganization | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isConfigured: boolean;
}

interface AuthContextValue extends AuthState {
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | Error | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: AuthError | Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | Error | null }>;
}

// =====================================================
// CREATE CONTEXT
// =====================================================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// =====================================================
// AUTH PROVIDER COMPONENT
// =====================================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    isConfigured: isSupabaseConfigured,
  });

  // Fetch user profile from database
  const fetchProfile = useCallback(async (userId: string): Promise<ProfileWithOrganization | null> => {
    if (!isSupabaseConfigured) return null;
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return profile as ProfileWithOrganization;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  }, []);

  // Update auth state
  const updateAuthState = useCallback(async (session: Session | null) => {
    if (session?.user) {
      const profile = await fetchProfile(session.user.id);
      setState(prev => ({
        ...prev,
        user: session.user,
        profile,
        session,
        isLoading: false,
        isAuthenticated: true,
      }));
    } else {
      setState(prev => ({
        ...prev,
        user: null,
        profile: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
      }));
    }
  }, [fetchProfile]);

  // Initialize auth state on mount
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Demo mode - no authentication
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
        isConfigured: false,
      }));
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateAuthState(session);
    }).catch(() => {
      setState(prev => ({ ...prev, isLoading: false }));
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event);
        await updateAuthState(session);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [updateAuthState]);

  // =====================================================
  // AUTH METHODS
  // =====================================================

  const demoModeError = () => ({ 
    error: new Error('Authentication not configured. Set up Supabase to enable user accounts.') as AuthError 
  });

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (!isSupabaseConfigured) return demoModeError();
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email.split('@')[0],
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) return demoModeError();
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) return demoModeError();
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  };

  const signInWithMagicLink = async (email: string) => {
    if (!isSupabaseConfigured) return demoModeError();
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setState(prev => ({
      ...prev,
      user: null,
      profile: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
    }));
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Authentication not configured') };
    }
    
    if (!state.user) {
      return { error: new Error('No user logged in') };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', state.user.id);

      if (error) {
        return { error: new Error(error.message) };
      }

      // Refresh profile after update
      await refreshProfile();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const refreshProfile = async () => {
    if (state.user && isSupabaseConfigured) {
      const profile = await fetchProfile(state.user.id);
      setState(prev => ({ ...prev, profile }));
    }
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured) return demoModeError();
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    if (!isSupabaseConfigured) return demoModeError();
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  };

  // =====================================================
  // CONTEXT VALUE
  // =====================================================

  const value: AuthContextValue = {
    ...state,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithMagicLink,
    signOut,
    updateProfile,
    refreshProfile,
    resetPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// =====================================================
// HOOK
// =====================================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// =====================================================
// UTILITY HOOKS
// =====================================================

export function useUser() {
  const { user, profile, isLoading } = useAuth();
  return { user, profile, isLoading };
}

export function useIsAuthenticated() {
  const { isAuthenticated, isLoading, isConfigured } = useAuth();
  return { isAuthenticated, isLoading, isConfigured };
}

export function useRequireAuth() {
  const { isAuthenticated, isLoading, isConfigured } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated && isConfigured) {
      window.location.href = '/auth/login';
    }
  }, [isAuthenticated, isLoading, isConfigured]);

  return { isAuthenticated, isLoading, isConfigured };
}

export default AuthContext;
