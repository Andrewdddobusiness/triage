"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { createClient } from '@/utils/supabase/client';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { checkAuth, setUser, setLoading, checkOnboarding, logout } = useAuthStore();

  useEffect(() => {
    // Initial auth check
    checkAuth();

    // Set up auth state listener
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
          const userData = {
            id: session.user.id,
            email: session.user.email,
          };
          setUser(userData);
          
          // Check onboarding for both SIGNED_IN and INITIAL_SESSION events
          checkOnboarding(session.user.id);
        } else if (event === 'SIGNED_OUT' || (!session && event !== 'INITIAL_SESSION')) {
          // Clear all auth state on sign out
          logout();
        }
        
        // Only set loading to false after handling the event
        if (event !== 'INITIAL_SESSION' || session !== null) {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [checkAuth, setUser, setLoading, checkOnboarding, logout]);

  return <>{children}</>;
}