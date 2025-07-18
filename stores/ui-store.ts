import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface UIStore {
  // Sidebar/Panel state
  sidebarOpen: boolean;
  selectedInquiryId: string | null;
  
  // Modal state
  activeModal: string | null;
  modalData: any;
  
  // Notification state
  notifications: Notification[];
  
  // Loading states
  globalLoading: boolean;
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSelectedInquiry: (id: string | null) => void;
  
  // Modal actions
  openModal: (modalId: string, data?: any) => void;
  closeModal: () => void;
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Loading actions
  setGlobalLoading: (loading: boolean) => void;
  
  // Utility actions
  reset: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // Initial state
      sidebarOpen: false,
      selectedInquiryId: null,
      activeModal: null,
      modalData: null,
      notifications: [],
      globalLoading: false,

      // Sidebar/Panel actions
      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSelectedInquiry: (id: string | null) => {
        set({ 
          selectedInquiryId: id,
          sidebarOpen: id !== null, // Auto-open sidebar when selecting inquiry
        });
      },

      // Modal actions
      openModal: (modalId: string, data?: any) => {
        set({ 
          activeModal: modalId, 
          modalData: data 
        });
      },

      closeModal: () => {
        set({ 
          activeModal: null, 
          modalData: null 
        });
      },

      // Notification actions
      addNotification: (notification: Omit<Notification, 'id'>) => {
        const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newNotification: Notification = {
          id,
          duration: 5000, // Default 5 seconds
          ...notification,
        };

        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));

        // Auto-remove notification after duration
        if (newNotification.duration && newNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, newNotification.duration);
        }
      },

      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id),
        }));
      },

      clearAllNotifications: () => {
        set({ notifications: [] });
      },

      // Loading actions
      setGlobalLoading: (loading: boolean) => {
        set({ globalLoading: loading });
      },

      // Utility actions
      reset: () => {
        set({
          sidebarOpen: false,
          selectedInquiryId: null,
          activeModal: null,
          modalData: null,
          notifications: [],
          globalLoading: false,
        });
      },
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        selectedInquiryId: state.selectedInquiryId,
        // Don't persist notifications or modal state
      }),
    }
  )
);

// Helper hooks for common UI patterns
export const useNotifications = () => {
  const { notifications, addNotification, removeNotification, clearAllNotifications } = useUIStore();
  
  const showSuccess = (title: string, message?: string) => {
    addNotification({ type: 'success', title, message });
  };
  
  const showError = (title: string, message?: string) => {
    addNotification({ type: 'error', title, message, duration: 7000 });
  };
  
  const showWarning = (title: string, message?: string) => {
    addNotification({ type: 'warning', title, message });
  };
  
  const showInfo = (title: string, message?: string) => {
    addNotification({ type: 'info', title, message });
  };
  
  return {
    notifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearAllNotifications,
  };
};

export const useModal = () => {
  const { activeModal, modalData, openModal, closeModal } = useUIStore();
  
  const isOpen = (modalId: string) => activeModal === modalId;
  
  return {
    activeModal,
    modalData,
    openModal,
    closeModal,
    isOpen,
  };
};

export const useInquiryPanel = () => {
  const { selectedInquiryId, sidebarOpen, setSelectedInquiry, setSidebarOpen } = useUIStore();
  
  const selectInquiry = (id: string) => {
    setSelectedInquiry(id);
  };
  
  const closePanel = () => {
    setSelectedInquiry(null);
  };
  
  const togglePanel = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return {
    selectedInquiryId,
    sidebarOpen,
    selectInquiry,
    closePanel,
    togglePanel,
  };
};