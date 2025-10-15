import { create } from 'zustand';
import { createClient } from '@/utils/supabase/client';

interface Inquiry {
  id: string;
  flow: string;
  name: string;
  phone: string;
  email?: string;
  inquiry_date: string;
  preferred_service_date?: string;
  preferred_service_date_text?: string;
  estimated_completion?: string;
  budget?: number;
  job_type?: string;
  job_description?: string;
  street_address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  call_sid?: string;
  assistant_id?: string;
  business_phone?: string;
  business_phone_id?: string;
  status: 'new' | 'contacted' | 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

interface InquiryFilters {
  status: string;
  search: string;
  dateRange: {
    from: string;
    to: string;
  };
  sortBy: 'created_at' | 'updated_at' | 'inquiry_date';
  sortOrder: 'asc' | 'desc';
}

interface InquiryStore {
  // State
  inquiries: Inquiry[];
  selectedInquiry: Inquiry | null;
  isLoading: boolean;
  error: string | null;
  filters: InquiryFilters;
  lastFetch: number;
  autoRefreshInterval: NodeJS.Timeout | null;
  
  // Computed
  filteredInquiries: Inquiry[];
  inquiryCount: number;
  statusCounts: Record<string, number>;
  
  // Actions
  fetchInquiries: (force?: boolean) => Promise<void>;
  selectInquiry: (id: string) => void;
  clearSelectedInquiry: () => void;
  updateFilters: (filters: Partial<InquiryFilters>) => void;
  resetFilters: () => void;
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
  updateInquiryStatus: (id: string, status: Inquiry['status']) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const defaultFilters: InquiryFilters = {
  status: 'all',
  search: '',
  dateRange: {
    from: '',
    to: '',
  },
  sortBy: 'created_at',
  sortOrder: 'desc',
};

export const useInquiryStore = create<InquiryStore>((set, get) => ({
  // Initial state
  inquiries: [],
  selectedInquiry: null,
  isLoading: false,
  error: null,
  filters: defaultFilters,
  lastFetch: 0,
  autoRefreshInterval: null,

  // Computed getters
  get filteredInquiries() {
    const { inquiries, filters } = get();
    
    let filtered = [...inquiries];
    
    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(inquiry => inquiry.status === filters.status);
    }
    
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(inquiry => 
        inquiry.name.toLowerCase().includes(searchTerm) ||
        inquiry.phone.includes(searchTerm) ||
        inquiry.email?.toLowerCase().includes(searchTerm) ||
        inquiry.job_description?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Date range filter
    if (filters.dateRange.from) {
      const fromDate = new Date(filters.dateRange.from);
      filtered = filtered.filter(inquiry => 
        new Date(inquiry.created_at) >= fromDate
      );
    }
    
    if (filters.dateRange.to) {
      const toDate = new Date(filters.dateRange.to);
      filtered = filtered.filter(inquiry => 
        new Date(inquiry.created_at) <= toDate
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      const aVal = a[filters.sortBy];
      const bVal = b[filters.sortBy];
      
      if (!aVal && !bVal) return 0;
      if (!aVal) return filters.sortOrder === 'asc' ? -1 : 1;
      if (!bVal) return filters.sortOrder === 'asc' ? 1 : -1;
      
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  },

  get inquiryCount() {
    return get().filteredInquiries.length;
  },

  get statusCounts() {
    const inquiries = get().inquiries;
    const counts = {
      all: inquiries.length,
      new: 0,
      contacted: 0,
      scheduled: 0,
      completed: 0,
      cancelled: 0,
    };
    
    inquiries.forEach(inquiry => {
      counts[inquiry.status] = (counts[inquiry.status] || 0) + 1;
    });
    
    return counts;
  },

  // Actions
  fetchInquiries: async (force = false) => {
    const state = get();
    
    // Avoid duplicate calls unless forced or cache is stale (>30 seconds)
    const now = Date.now();
    const cacheAge = now - state.lastFetch;
    if (!force && cacheAge < 30000 && state.inquiries.length > 0) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const supabase = createClient();

      const { data, error } = await supabase.functions.invoke<{
        success: boolean;
        data?: Inquiry[];
        error?: string;
      }>('get-inquiries');

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to fetch inquiries');
      }

      set({
        inquiries: data.data || [],
        isLoading: false,
        error: null,
        lastFetch: now,
      });
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch inquiries',
      });
    }
  },

  selectInquiry: (id: string) => {
    const inquiry = get().inquiries.find(i => i.id === id);
    set({ selectedInquiry: inquiry || null });
  },

  clearSelectedInquiry: () => {
    set({ selectedInquiry: null });
  },

  updateFilters: (newFilters: Partial<InquiryFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  resetFilters: () => {
    set({ filters: defaultFilters });
  },

  startAutoRefresh: () => {
    const state = get();
    if (state.autoRefreshInterval) {
      clearInterval(state.autoRefreshInterval);
    }

    const intervalId = setInterval(() => {
      get().fetchInquiries(true);
    }, 30000); // Refresh every 30 seconds

    set({ autoRefreshInterval: intervalId });
  },

  stopAutoRefresh: () => {
    const state = get();
    if (state.autoRefreshInterval) {
      clearInterval(state.autoRefreshInterval);
      set({ autoRefreshInterval: null });
    }
  },

  updateInquiryStatus: async (id: string, status: Inquiry['status']) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('customer_inquiries')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update local state
      set((state) => ({
        inquiries: state.inquiries.map(inquiry =>
          inquiry.id === id 
            ? { ...inquiry, status, updated_at: new Date().toISOString() }
            : inquiry
        ),
        selectedInquiry: state.selectedInquiry?.id === id
          ? { ...state.selectedInquiry, status, updated_at: new Date().toISOString() }
          : state.selectedInquiry,
      }));
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to update inquiry status',
      });
    }
  },

  clearError: () => set({ error: null }),

  reset: () => {
    const state = get();
    if (state.autoRefreshInterval) {
      clearInterval(state.autoRefreshInterval);
    }
    set({
      inquiries: [],
      selectedInquiry: null,
      isLoading: false,
      error: null,
      filters: defaultFilters,
      lastFetch: 0,
      autoRefreshInterval: null,
    });
  },
}));
