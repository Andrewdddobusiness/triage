"use client";

import { X, Phone, Mail, MapPin, Calendar, DollarSign, User, FileText, Clock, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/inquiry/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Inquiry, fetchInquiryDetails } from "@/app/actions/fetch-inquiries";
import { toast } from "sonner";

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

function capitalizeText(text: string | null | undefined) {
  if (!text) return "Not specified";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function copyToClipboard(text: string, fieldName: string) {
  navigator.clipboard.writeText(text).then(() => {
    toast.success(`${fieldName} copied to clipboard`);
  }).catch(() => {
    toast.error(`Failed to copy ${fieldName}`);
  });
}

function formatFullAddress(inquiry: Inquiry | undefined) {
  if (!inquiry) return "Not provided";
  
  const addressParts = [
    inquiry.street_address,
    inquiry.city,
    inquiry.state,
    inquiry.postal_code,
    inquiry.country
  ].filter(Boolean);
  
  return addressParts.length > 0 ? addressParts.join(", ") : "Not provided";
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
            <StatusBadge 
              status={inquiry?.status || ""} 
              inquiryDate={inquiry?.inquiry_date} 
            />
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
                  <div className="flex items-center gap-2">
                    <p className="text-sm flex-1">{inquiry?.name || "Not provided"}</p>
                    {inquiry?.name && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(inquiry.name, "Customer name")}
                      >
                        <Copy className="h-3 w-3" />
                        <span className="sr-only">Copy customer name</span>
                      </Button>
                    )}
                  </div>
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
                  <div className="flex items-center gap-2">
                    <p className="text-sm flex-1">{inquiry?.phone || "Not provided"}</p>
                    {inquiry?.phone && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(inquiry.phone, "Phone number")}
                      >
                        <Copy className="h-3 w-3" />
                        <span className="sr-only">Copy phone number</span>
                      </Button>
                    )}
                  </div>
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
                  <div className="flex items-center gap-2">
                    <p className="text-sm flex-1">{inquiry?.email || "Not provided"}</p>
                    {inquiry?.email && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(inquiry.email!, "Email address")}
                      >
                        <Copy className="h-3 w-3" />
                        <span className="sr-only">Copy email address</span>
                      </Button>
                    )}
                  </div>
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
                  <p className="text-sm">{capitalizeText(inquiry?.job_type)}</p>
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
                  <p className="text-sm whitespace-pre-wrap">{capitalizeText(inquiry?.job_description) !== "Not specified" ? capitalizeText(inquiry?.job_description) : "No description provided"}</p>
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
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </h3>
                {formatFullAddress(inquiry) !== "Not provided" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => copyToClipboard(formatFullAddress(inquiry), "Full address")}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy Address
                  </Button>
                )}
              </div>

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
