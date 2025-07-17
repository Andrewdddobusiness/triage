"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table/table";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import { toast } from "sonner";
import { SetupAlert } from "@/components/setup-alert";
import { InquiryDetailsPanel } from "@/components/inquiry-details-panel";
import { fetchUserInquiries } from "@/app/actions/fetch-inquiries";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { SidebarInset } from "@/components/ui/sidebar";
import { BreadcrumbHeader } from "@/components/dashboard/breadcrumb-header";

export default function DashboardPage() {
  const searchParams = useSearchParams();

  // State for the inquiry details panel
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);

  // Function to handle inquiry row click
  const handleInquiryClick = (inquiryId: string) => {
    setSelectedInquiryId(inquiryId);
  };

  // Function to close panel
  const handleClosePanel = () => {
    setSelectedInquiryId(null);
  };

  // Handle payment success notification
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      toast.success("Subscription activated successfully! Welcome to Spaak!");
      // Clear the query parameter by replacing the URL
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [searchParams]);

  // Fetch inquiries data using TanStack Query
  const {
    data: inquiriesResult,
    isLoading: inquiriesLoading,
    error: inquiriesError,
  } = useQuery({
    queryKey: ["user-inquiries"],
    queryFn: fetchUserInquiries,
    refetchInterval: 30000, // Refetch every 30 seconds to sync with cron job
    refetchOnWindowFocus: true,
    staleTime: 25000, // Consider data stale after 25 seconds
  });
  console.log(inquiriesResult);
  // Handle errors
  useEffect(() => {
    if (inquiriesError) {
      console.error("Error fetching inquiries:", inquiriesError);
      toast.error("Failed to load inquiries");
    }
  }, [inquiriesError]);

  // Extract inquiries from result
  const inquiries = inquiriesResult?.data || [];

  if (inquiriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Loading inquiries...</p>
        </div>
      </div>
    );
  }

  // Compute analytics metrics
  const analytics = {
    new: inquiries.filter((inq) => inq.status === "new").length,
    contacted: inquiries.filter((inq) => inq.status === "contacted").length,
    scheduled: inquiries.filter((inq) => inq.status === "scheduled").length,
    completed: inquiries.filter((inq) => inq.status === "completed").length,
    cancelled: inquiries.filter((inq) => inq.status === "cancelled").length,
  };

  // Show all inquiries in the table (not just new ones)
  const allInquiries = inquiries;

  return (
    <ResizablePanelGroup direction="horizontal" className="h-screen">
      {/* Main Content Panel */}
      <ResizablePanel defaultSize={selectedInquiryId ? 70 : 100} minSize={50}>
        <SidebarInset>
          <BreadcrumbHeader currentPage="Overview" />
          <div className="space-y-6 px-4">
            {/* Setup Alert */}
            <SetupAlert />

            {/* Analytics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="tracking-tight text-sm font-medium">New Inquiries</h3>
                  <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{analytics.new}</div>
              </div>
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="tracking-tight text-sm font-medium">Contacted</h3>
                  <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{analytics.contacted}</div>
              </div>
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="tracking-tight text-sm font-medium">Scheduled</h3>
                  <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{analytics.scheduled}</div>
              </div>
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="tracking-tight text-sm font-medium">Completed</h3>
                  <TrendingDownIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{analytics.completed}</div>
              </div>
            </div>

            {/* Data Table */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">All Inquiries</h3>
                <DataTable data={allInquiries} onRowClick={handleInquiryClick} />
              </div>
            </div>
          </div>
        </SidebarInset>
      </ResizablePanel>

      {/* Inquiry Details Panel */}
      {selectedInquiryId && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={30} minSize={25} maxSize={50}>
            <InquiryDetailsPanel inquiryId={selectedInquiryId} onClose={handleClosePanel} />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}
