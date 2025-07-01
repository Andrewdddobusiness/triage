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
        console.log('🔄 Auth state change:', event, session?.user?.email || 'no user');
        
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
          console.log('✅ Setting user in auth store:', session.user.email);
          const userData = {
            id: session.user.id,
            email: session.user.email,
          };
          setUser(userData);
          
          // Only check onboarding for SIGNED_IN events, not INITIAL_SESSION
          if (event === 'SIGNED_IN') {
            console.log('🔍 Checking onboarding for user:', session.user.id);
            checkOnboarding(session.user.id);
          }
        } else if (event === 'SIGNED_OUT' || (!session && event !== 'INITIAL_SESSION')) {
          // Clear all auth state on sign out
          console.log('🚪 User signed out');
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