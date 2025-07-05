import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createClient } from '@/utils/supabase/client';
import { getOnboardingData } from '@/app/actions/stripe/subscription';

interface User {
  id: string;
  email?: string;
  // Add other user fields as needed
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  needsOnboarding: boolean;
  needsPostSubscriptionOnboarding: boolean;
  onboardingLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  setOnboarding: (needsOnboarding: boolean) => void;
  setPostSubscriptionOnboarding: (needsPostSubscriptionOnboarding: boolean) => void;
  login: (user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  checkOnboarding: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      isHydrated: false,
      needsOnboarding: false,
      needsPostSubscriptionOnboarding: false,
      onboardingLoading: false,

      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),

      setLoading: (loading) => set({ isLoading: loading }),

      setHydrated: (hydrated) => set({ isHydrated: hydrated }),

      setOnboarding: (needsOnboarding) => set({ needsOnboarding }),

      setPostSubscriptionOnboarding: (needsPostSubscriptionOnboarding) => set({ needsPostSubscriptionOnboarding }),

      login: (user) => set({ 
        user, 
        isAuthenticated: true,
        isLoading: false 
      }),

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false,
          needsOnboarding: false,
          needsPostSubscriptionOnboarding: false
        });
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true });
          const supabase = createClient();
          const { data: { user }, error } = await supabase.auth.getUser();
          
          if (error || !user) {
            set({ 
              user: null, 
              isAuthenticated: false,
              isLoading: false 
            });
            return;
          }

          const userData = {
            id: user.id,
            email: user.email,
          };
          
          set({ 
            user: userData, 
            isAuthenticated: true,
            isLoading: false 
          });

          // Check onboarding status after successful auth
          get().checkOnboarding(user.id);
        } catch (error) {
          console.error('Auth check error:', error);
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false 
          });
        }
      },

      checkOnboarding: async (userId: string) => {
        try {
          set({ onboardingLoading: true });
          const result = await getOnboardingData(userId);
          
          
          set({ 
            needsOnboarding: result.needsOnboarding,
            needsPostSubscriptionOnboarding: result.needsPostSubscriptionOnboarding,
            onboardingLoading: false 
          });
        } catch (error) {
          console.error('Onboarding check error:', error);
          set({ 
            needsOnboarding: false,
            needsPostSubscriptionOnboarding: false,
            onboardingLoading: false 
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        // Only use localStorage on client side
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // Return a no-op storage for SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      // Only persist essential data, not loading states
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);