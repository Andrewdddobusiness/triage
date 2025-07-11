"use client";

import { useEffect } from "react";
import { X, Phone, Mail, MapPin, Calendar, DollarSign, User, FileText, Clock, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Inquiry, fetchInquiryDetails } from "@/app/actions/fetch-inquiries";

interface InquiryDetailsPanelProps {
  inquiryId: string | null;
  onClose: () => void;
}

// Wrapper function for TanStack Query that handles server action response
async function fetchInquiryDetailsWrapper(inquiryId: string): Promise<Inquiry> {
  const result = await fetchInquiryDetails(inquiryId);
  
  if (!result.success) {
    throw new Error(result.error || "Failed to fetch inquiry details");
  }
  
  if (!result.data) {
    throw new Error("No inquiry data found");
  }
  
  return result.data;
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
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "Invalid date";
  }
}

function formatCurrency(amount: number | null | undefined) {
  if (!amount) return "Not specified";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount);
}

function getStatusColor(status: string) {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-800";
    case "contacted":
      return "bg-yellow-100 text-yellow-800";
    case "scheduled":
      return "bg-purple-100 text-purple-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function InquiryDetailsPanel({ inquiryId, onClose }: InquiryDetailsPanelProps) {
  // Fetch inquiry details using TanStack Query with server action
  const {
    data: inquiry,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["inquiry-details", inquiryId],
    queryFn: () => fetchInquiryDetailsWrapper(inquiryId!),
    enabled: !!inquiryId,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Don't render if no inquiry ID
  if (!inquiryId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Select an inquiry to view details</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white border-l flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
        {isLoading ? (
          <FieldSkeleton />
        ) : (
          <div className="flex justify-start">
            <Badge className={getStatusColor(inquiry?.status || "")}>
              {inquiry?.status ? inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1) : "Unknown"}
            </Badge>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
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
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Caller Details</h3>

              {isLoading ? (
                <FieldSkeleton />
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer Name
                  </label>
                  <p className="text-sm">{inquiry?.name || "Not provided"}</p>
                </div>
              )}

              {isLoading ? (
                <FieldSkeleton />
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </label>
                  <p className="text-sm">{inquiry?.phone || "Not provided"}</p>
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
                  <p className="text-sm">{inquiry?.email || "Not provided"}</p>
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
                  <p className="text-sm">{inquiry?.job_type || "Not specified"}</p>
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
                  <p className="text-sm whitespace-pre-wrap">{inquiry?.job_description || "No description provided"}</p>
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
                  <p className="text-sm">{formatCurrency(inquiry?.budget)}</p>
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
                  <p className="text-sm">{inquiry?.street_address || "Not provided"}</p>
                </div>
              )}

              {isLoading ? (
                <FieldSkeleton />
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">City</label>
                    <p className="text-sm">{inquiry?.city || "Not provided"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">State</label>
                    <p className="text-sm">{inquiry?.state || "Not provided"}</p>
                  </div>
                </div>
              )}

              {isLoading ? (
                <FieldSkeleton />
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Postal Code</label>
                    <p className="text-sm">{inquiry?.postal_code || "Not provided"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Country</label>
                    <p className="text-sm">{inquiry?.country || "Not provided"}</p>
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
                  <p className="text-sm">
                    {inquiry?.preferred_service_date_text || formatDate(inquiry?.preferred_service_date)}
                  </p>
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
                  <p className="text-sm">{formatDate(inquiry?.created_at)}</p>
                </div>
              )}

              {isLoading ? (
                <FieldSkeleton />
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Last Updated</label>
                  <p className="text-sm">{formatDate(inquiry?.updated_at)}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
