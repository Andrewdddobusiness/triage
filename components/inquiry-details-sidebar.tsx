"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Phone, Mail, MapPin, Calendar, DollarSign, User, FileText, Clock, Building, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Inquiry } from "@/app/actions/fetch-inquiries";
import { useSidebar } from "@/components/ui/sidebar";

interface InquiryDetailsSidebarProps {
  inquiryId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

// Default and constraints for sidebar width
const DEFAULT_WIDTH = 400;
const MIN_WIDTH = 300;
const MAX_WIDTH = 800;

// Function to fetch individual inquiry details
async function fetchInquiryDetails(inquiryId: string): Promise<Inquiry> {
  const response = await fetch(`/api/inquiries/${inquiryId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch inquiry details');
  }
  return response.json();
}

function FieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-6 w-full" />
    </div>
  );
}

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "Not specified";
  try {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return "Invalid date";
  }
}

function formatCurrency(amount: number | null | undefined) {
  if (!amount) return "Not specified";
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount);
}

function getStatusColor(status: string) {
  switch (status) {
    case 'new':
      return 'bg-blue-100 text-blue-800';
    case 'contacted':
      return 'bg-yellow-100 text-yellow-800';
    case 'scheduled':
      return 'bg-purple-100 text-purple-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function InquiryDetailsSidebar({ inquiryId, isOpen, onClose }: InquiryDetailsSidebarProps) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Get sidebar state from context
  const { state: sidebarState, isMobile } = useSidebar();
  
  // Calculate the right position based on sidebar state
  const getRightPosition = useCallback(() => {
    if (isMobile) {
      return 0; // On mobile, main sidebar is a sheet overlay, so no offset needed
    }
    
    // On desktop, account for the main sidebar width
    if (sidebarState === "expanded") {
      return 256; // 16rem = 256px
    } else {
      return 48; // 3rem = 48px (collapsed/icon mode)
    }
  }, [sidebarState, isMobile]);

  // Load saved width from localStorage
  useEffect(() => {
    const savedWidth = localStorage.getItem('inquiry-sidebar-width');
    if (savedWidth) {
      const parsedWidth = parseInt(savedWidth, 10);
      if (parsedWidth >= MIN_WIDTH && parsedWidth <= MAX_WIDTH) {
        setWidth(parsedWidth);
      }
    }
  }, []);

  // Save width to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('inquiry-sidebar-width', width.toString());
  }, [width]);

  // Handle mouse resize
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  // Handle resize logic
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate new width based on mouse position and sidebar offset
      const rightOffset = getRightPosition();
      const availableWidth = window.innerWidth - rightOffset;
      const newWidth = availableWidth - e.clientX + rightOffset;
      const clampedWidth = Math.min(Math.max(newWidth, MIN_WIDTH), MAX_WIDTH);
      setWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, getRightPosition]);

  // Fetch inquiry details using TanStack Query
  const {
    data: inquiry,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["inquiry-details", inquiryId],
    queryFn: () => fetchInquiryDetails(inquiryId!),
    enabled: !!inquiryId && isOpen,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className="fixed top-0 bottom-0 bg-black/20 backdrop-blur-sm z-40"
        style={{
          left: `${getRightPosition()}px`,
          right: 0
        }}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="fixed top-0 h-screen bg-white border-l shadow-2xl flex flex-col z-50 animate-in slide-in-from-right-0 duration-300"
        style={{ 
          width: `${width}px`,
          right: `${getRightPosition()}px`
        }}
      >
      {/* Resize Handle */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors group ${
          isResizing ? 'bg-blue-500' : 'bg-transparent hover:bg-blue-200'
        }`}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
        <h2 className="text-xl font-semibold">Inquiry Details</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {error ? (
          <div className="text-center py-8">
            <p className="text-red-600">Failed to load inquiry details</p>
            <Button variant="outline" onClick={() => window.location.reload()} className="mt-2">
              Retry
            </Button>
          </div>
        ) : (
          <>
            {/* Status and Basic Info */}
            <div className="space-y-4">
                {isLoading ? (
                  <FieldSkeleton />
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div>
                      <Badge className={getStatusColor(inquiry?.status || '')}>
                        {inquiry?.status?.charAt(0).toUpperCase() + inquiry?.status?.slice(1)}
                      </Badge>
                    </div>
                  </div>
                )}

                {isLoading ? (
                  <FieldSkeleton />
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Customer Name
                    </label>
                    <p className="text-base font-medium">{inquiry?.name || "Not provided"}</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Contact Information</h3>
                
                {isLoading ? (
                  <FieldSkeleton />
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </label>
                    <p className="text-base">{inquiry?.phone || "Not provided"}</p>
                  </div>
                )}

                {isLoading ? (
                  <FieldSkeleton />
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </label>
                    <p className="text-base">{inquiry?.email || "Not provided"}</p>
                  </div>
                )}

                {isLoading ? (
                  <FieldSkeleton />
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Business Phone
                    </label>
                    <p className="text-base text-gray-500">{inquiry?.business_phone || "Not available"}</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Job Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Job Details</h3>
                
                {isLoading ? (
                  <FieldSkeleton />
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Job Type</label>
                    <p className="text-base">{inquiry?.job_type || "Not specified"}</p>
                  </div>
                )}

                {isLoading ? (
                  <FieldSkeleton />
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Job Description
                    </label>
                    <p className="text-base whitespace-pre-wrap">{inquiry?.job_description || "No description provided"}</p>
                  </div>
                )}

                {isLoading ? (
                  <FieldSkeleton />
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Budget
                    </label>
                    <p className="text-base">{formatCurrency(inquiry?.budget)}</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </h3>
                
                {isLoading ? (
                  <FieldSkeleton />
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Street Address</label>
                    <p className="text-base">{inquiry?.street_address || "Not provided"}</p>
                  </div>
                )}

                {isLoading ? (
                  <FieldSkeleton />
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">City</label>
                      <p className="text-base">{inquiry?.city || "Not provided"}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">State</label>
                      <p className="text-base">{inquiry?.state || "Not provided"}</p>
                    </div>
                  </div>
                )}

                {isLoading ? (
                  <FieldSkeleton />
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">Postal Code</label>
                      <p className="text-base">{inquiry?.postal_code || "Not provided"}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">Country</label>
                      <p className="text-base">{inquiry?.country || "Not provided"}</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Dates and Timeline */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Timeline
                </h3>
                
                {isLoading ? (
                  <FieldSkeleton />
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Preferred Service Date</label>
                    <p className="text-base">{inquiry?.preferred_service_date_text || formatDate(inquiry?.preferred_service_date)}</p>
                  </div>
                )}

                {isLoading ? (
                  <FieldSkeleton />
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Inquiry Received
                    </label>
                    <p className="text-base">{formatDate(inquiry?.created_at)}</p>
                  </div>
                )}

                {isLoading ? (
                  <FieldSkeleton />
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Last Updated</label>
                    <p className="text-base">{formatDate(inquiry?.updated_at)}</p>
                  </div>
                )}
              </div>
          </>
        )}
      </div>
      </div>
    </>
  );
}