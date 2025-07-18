import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/utils/supabase/client';

interface SubscriptionData {
  hasActiveSubscription: boolean;
  hasSubscriptionHistory: boolean;
  subscription?: {
    status: string;
    current_period_start: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    canceled_at?: string;
    trial_end?: string;
    billing_cycle: string;
    plan_name?: string;
  };
}

interface SubscriptionStore {
  // State
  subscription: SubscriptionData | null;
  isLoading: boolean;
  error: string | null;
  lastFetch: number;
  isPolling: boolean;
  pollingInterval: NodeJS.Timeout | null;

  // Actions
  checkSubscription: (userId: string, force?: boolean) => Promise<void>;
  pollForActivation: (userId: string) => Promise<void>;
  stopPolling: () => void;
  clearError: () => void;
  reset: () => void;

  // Computed
  hasActiveSubscription: boolean;
  hasSubscriptionHistory: boolean;
  isSubscriptionCancelled: boolean;
  nextBillingDate: string | null;
  planName: string;
}

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set, get) => ({
      // Initial state
      subscription: null,
      isLoading: false,
      error: null,
      lastFetch: 0,
      isPolling: false,
      pollingInterval: null,

      // Actions
      checkSubscription: async (userId: string, force = false) => {
        const state = get();
        
        // Avoid duplicate calls unless forced or cache is stale (>30 seconds)
        const now = Date.now();
        const cacheAge = now - state.lastFetch;
        if (!force && cacheAge < 30000 && state.subscription) {
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            throw new Error('No active session');
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/stripe-check-subscription`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ userId }),
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const subscriptionData = await response.json();
          
          set({
            subscription: subscriptionData,
            isLoading: false,
            error: null,
            lastFetch: now,
          });
        } catch (error) {
          console.error('Error checking subscription:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to check subscription',
          });
        }
      },

      pollForActivation: async (userId: string) => {
        const state = get();
        if (state.isPolling) return;

        set({ isPolling: true });

        let attempts = 0;
        const maxAttempts = 8;
        const pollInterval = 2500;

        const poll = async () => {
          attempts++;
          await get().checkSubscription(userId, true);
          
          const currentState = get();
          
          if (currentState.subscription?.hasActiveSubscription) {
            // Success! Stop polling
            set({ isPolling: false });
            
            // Refresh page after success
            setTimeout(() => {
              window.location.reload();
            }, 2000);
            return;
          }

          if (attempts < maxAttempts) {
            // Continue polling
            const timeoutId = setTimeout(poll, pollInterval);
            set({ pollingInterval: timeoutId });
          } else {
            // Max attempts reached
            set({ isPolling: false });
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          }
        };

        // Start polling after initial delay
        setTimeout(poll, 2000);
      },

      stopPolling: () => {
        const state = get();
        if (state.pollingInterval) {
          clearTimeout(state.pollingInterval);
        }
        set({ isPolling: false, pollingInterval: null });
      },

      clearError: () => set({ error: null }),

      reset: () => {
        const state = get();
        if (state.pollingInterval) {
          clearTimeout(state.pollingInterval);
        }
        set({
          subscription: null,
          isLoading: false,
          error: null,
          lastFetch: 0,
          isPolling: false,
          pollingInterval: null,
        });
      },

      // Computed getters
      get hasActiveSubscription() {
        return get().subscription?.hasActiveSubscription ?? false;
      },

      get hasSubscriptionHistory() {
        return get().subscription?.hasSubscriptionHistory ?? false;
      },

      get isSubscriptionCancelled() {
        const subscription = get().subscription?.subscription;
        return subscription?.cancel_at_period_end === true && subscription?.status === 'active';
      },

      get nextBillingDate() {
        const subscription = get().subscription?.subscription;
        return subscription?.current_period_end ?? null;
      },

      get planName() {
        const subscription = get().subscription?.subscription;
        return subscription?.plan_name ?? 'Pro';
      },
    }),
    {
      name: 'subscription-store',
      partialize: (state) => ({
        subscription: state.subscription,
        lastFetch: state.lastFetch,
      }),
    }
  )
);