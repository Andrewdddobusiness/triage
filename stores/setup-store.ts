import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/utils/supabase/client';

interface SetupStatus {
  needs_assistant_setup: boolean;
  needs_phone_number_setup: boolean;
  has_seen_assistant_setup: boolean;
  has_seen_phone_number_setup: boolean;
  service_provider_assistant?: {
    assistant_id: string;
    greeting_message: string;
    enabled: boolean;
  };
  phone_number?: {
    phone_number: string;
    friendly_name: string;
    is_active: boolean;
  };
}

interface AssistantPreset {
  id: string;
  name: string;
  description: string;
  voice_provider: string;
  assistant_id: string;
  voice_id: string;
  default_greeting: string;
  avatar_url?: string;
}

interface SetupStore {
  // State
  setupStatus: SetupStatus | null;
  isLoading: boolean;
  error: string | null;
  
  // Assistant setup
  assistantPresets: AssistantPreset[];
  selectedAssistantId: string | null;
  customGreeting: string;
  
  // Phone number setup
  availablePhoneNumbers: any[];
  selectedPhoneNumber: string | null;
  
  // Setup flow
  currentStep: 'assistant' | 'phone' | 'complete';
  isProcessing: boolean;
  
  // Actions
  checkSetupStatus: () => Promise<void>;
  fetchAssistantPresets: () => Promise<void>;
  fetchAvailablePhoneNumbers: () => Promise<void>;
  setSelectedAssistant: (assistantId: string) => void;
  setCustomGreeting: (greeting: string) => void;
  setSelectedPhoneNumber: (phoneNumber: string) => void;
  setCurrentStep: (step: 'assistant' | 'phone' | 'complete') => void;
  
  // Setup actions
  saveAssistantSetup: () => Promise<void>;
  assignPhoneNumber: () => Promise<void>;
  completeSetup: () => Promise<void>;
  skipSetup: () => Promise<void>;
  
  // Utility
  clearError: () => void;
  reset: () => void;
  
  // Computed
  isSetupComplete: boolean;
  needsSetup: boolean;
  currentStepTitle: string;
  canProceed: boolean;
}

export const useSetupStore = create<SetupStore>()(
  persist(
    (set, get) => ({
      // Initial state
      setupStatus: null,
      isLoading: false,
      error: null,
      assistantPresets: [],
      selectedAssistantId: null,
      customGreeting: '',
      availablePhoneNumbers: [],
      selectedPhoneNumber: null,
      currentStep: 'assistant',
      isProcessing: false,

      // Actions
      checkSetupStatus: async () => {
        set({ isLoading: true, error: null });

        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!user || !session?.access_token) {
            throw new Error('No authenticated user');
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/check-setup-status`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ userId: user.id }),
            }
          );

          if (!response.ok) {
            throw new Error('Failed to check setup status');
          }

          const setupStatus = await response.json();
          
          set({
            setupStatus,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Error checking setup status:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to check setup status',
          });
        }
      },

      fetchAssistantPresets: async () => {
        try {
          const supabase = createClient();
          const { data: presets, error } = await supabase
            .from('assistant_presets')
            .select('*')
            .order('name');

          if (error) {
            throw error;
          }

          set({ assistantPresets: presets || [] });
        } catch (error) {
          console.error('Error fetching assistant presets:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch assistant presets',
          });
        }
      },

      fetchAvailablePhoneNumbers: async () => {
        try {
          const supabase = createClient();
          const { data: phoneNumbers, error } = await supabase
            .from('twilio_phone_numbers')
            .select('*')
            .is('assigned_to', null)
            .eq('is_active', true);

          if (error) {
            throw error;
          }

          set({ availablePhoneNumbers: phoneNumbers || [] });
        } catch (error) {
          console.error('Error fetching phone numbers:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch phone numbers',
          });
        }
      },

      setSelectedAssistant: (assistantId: string) => {
        const preset = get().assistantPresets.find(p => p.assistant_id === assistantId);
        set({ 
          selectedAssistantId: assistantId,
          customGreeting: preset?.default_greeting || '',
        });
      },

      setCustomGreeting: (greeting: string) => {
        set({ customGreeting: greeting });
      },

      setSelectedPhoneNumber: (phoneNumber: string) => {
        set({ selectedPhoneNumber: phoneNumber });
      },

      setCurrentStep: (step: 'assistant' | 'phone' | 'complete') => {
        set({ currentStep: step });
      },

      saveAssistantSetup: async () => {
        const { selectedAssistantId, customGreeting } = get();
        
        if (!selectedAssistantId) {
          throw new Error('No assistant selected');
        }

        set({ isProcessing: true, error: null });

        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!user || !session?.access_token) {
            throw new Error('No authenticated user');
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/save-assistant-setup`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                userId: user.id,
                assistantId: selectedAssistantId,
                greetingMessage: customGreeting,
              }),
            }
          );

          if (!response.ok) {
            throw new Error('Failed to save assistant setup');
          }

          // Move to phone number setup
          set({ 
            isProcessing: false,
            currentStep: 'phone',
          });
          
          // Refresh setup status
          await get().checkSetupStatus();
        } catch (error) {
          console.error('Error saving assistant setup:', error);
          set({
            isProcessing: false,
            error: error instanceof Error ? error.message : 'Failed to save assistant setup',
          });
        }
      },

      assignPhoneNumber: async () => {
        const { selectedPhoneNumber } = get();
        
        if (!selectedPhoneNumber) {
          throw new Error('No phone number selected');
        }

        set({ isProcessing: true, error: null });

        try {
          const supabase = createClient();
          const { data, error } = await supabase.functions.invoke<{
            success: boolean;
            phoneNumber?: string;
            error?: string;
          }>('assign-phone-number');

          if (error) {
            throw error;
          }

          if (!data?.success) {
            throw new Error(data?.error || 'Failed to assign phone number');
          }

          // Complete setup
          set({ 
            isProcessing: false,
            currentStep: 'complete',
          });
          
          // Refresh setup status
          await get().checkSetupStatus();
        } catch (error) {
          console.error('Error assigning phone number:', error);
          set({
            isProcessing: false,
            error: error instanceof Error ? error.message : 'Failed to assign phone number',
          });
        }
      },

      completeSetup: async () => {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            throw new Error('No authenticated user');
          }

          // Mark setup as complete
          const { error } = await supabase
            .from('service_providers')
            .update({ 
              has_seen_assistant_setup: true,
              has_seen_phone_number_setup: true,
            })
            .eq('auth_user_id', user.id);

          if (error) {
            throw error;
          }

          // Refresh setup status
          await get().checkSetupStatus();
        } catch (error) {
          console.error('Error completing setup:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to complete setup',
          });
        }
      },

      skipSetup: async () => {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            throw new Error('No authenticated user');
          }

          // Mark as seen but not necessarily complete
          const { error } = await supabase
            .from('service_providers')
            .update({ 
              has_seen_assistant_setup: true,
              has_seen_phone_number_setup: true,
            })
            .eq('auth_user_id', user.id);

          if (error) {
            throw error;
          }

          // Refresh setup status
          await get().checkSetupStatus();
        } catch (error) {
          console.error('Error skipping setup:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to skip setup',
          });
        }
      },

      clearError: () => set({ error: null }),

      reset: () => {
        set({
          setupStatus: null,
          isLoading: false,
          error: null,
          assistantPresets: [],
          selectedAssistantId: null,
          customGreeting: '',
          availablePhoneNumbers: [],
          selectedPhoneNumber: null,
          currentStep: 'assistant',
          isProcessing: false,
        });
      },

      // Computed getters
      get isSetupComplete() {
        const status = get().setupStatus;
        return status ? 
          !status.needs_assistant_setup && !status.needs_phone_number_setup :
          false;
      },

      get needsSetup() {
        const status = get().setupStatus;
        return status ? 
          status.needs_assistant_setup || status.needs_phone_number_setup :
          false;
      },

      get currentStepTitle() {
        const step = get().currentStep;
        switch (step) {
          case 'assistant':
            return 'Choose Your AI Assistant';
          case 'phone':
            return 'Select Phone Number';
          case 'complete':
            return 'Setup Complete';
          default:
            return 'Setup';
        }
      },

      get canProceed() {
        const { currentStep, selectedAssistantId, selectedPhoneNumber } = get();
        switch (currentStep) {
          case 'assistant':
            return !!selectedAssistantId;
          case 'phone':
            return !!selectedPhoneNumber;
          case 'complete':
            return true;
          default:
            return false;
        }
      },
    }),
    {
      name: 'setup-store',
      partialize: (state) => ({
        setupStatus: state.setupStatus,
        selectedAssistantId: state.selectedAssistantId,
        customGreeting: state.customGreeting,
        selectedPhoneNumber: state.selectedPhoneNumber,
        currentStep: state.currentStep,
      }),
    }
  )
);
