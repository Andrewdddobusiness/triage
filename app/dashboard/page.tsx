"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { DataTable } from "@/components/data/data-table/table";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import { toast } from "sonner";
import { SetupAlert } from "@/components/setup-alert";
import { InquiryDetailsPanel } from "@/components/inquiry-details-panel";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { BreadcrumbHeader } from "@/components/dashboard/breadcrumb-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useInquiryStore } from "@/stores/inquiry-store";
import { useInquiryPanel } from "@/stores/ui-store";

// Skeleton table component for loading state
function SkeletonTable() {
  return (
    <div className="space-y-4">
      {/* Filter controls skeleton */}
      <div className="flex flex-wrap items-center gap-4 px-2 sm:px-4 lg:px-6">
        <Skeleton className="h-10 w-[200px] lg:w-[250px]" />
        <Skeleton className="h-10 w-[140px]" />
        <Skeleton className="h-10 w-[140px]" />
        <Skeleton className="h-10 w-[120px]" />
        <Skeleton className="h-10 w-[140px]" />
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-lg border mx-2 sm:mx-4 lg:mx-6">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead className="w-12"></TableHead>
              <TableHead>Customer Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Inquiry Date</TableHead>
              <TableHead>Service Type</TableHead>
              <TableHead>Job Time</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Generate 5 skeleton rows */}
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-36" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-12 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-4" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between px-2 sm:px-4 lg:px-6">
        <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex w-full items-center gap-2 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="h-4 w-24" />
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const searchParams = useSearchParams();

  // Get sidebar controls
  const { open: sidebarOpen, setOpen: setSidebarOpen } = useSidebar();

  // Use inquiry store and UI store
  const { 
    inquiries, 
    isLoading: inquiriesLoading, 
    error: inquiriesError,
    fetchInquiries, 
    startAutoRefresh, 
    stopAutoRefresh 
  } = useInquiryStore();
  
  const { 
    selectedInquiryId, 
    selectInquiry, 
    closePanel 
  } = useInquiryPanel();

  // Initialize data fetch and auto-refresh
  useEffect(() => {
    fetchInquiries();
    startAutoRefresh();
    
    return () => {
      stopAutoRefresh();
    };
  }, [fetchInquiries, startAutoRefresh, stopAutoRefresh]);

  // Function to handle inquiry row click - closes sidebar when opening inquiry panel
  const handleInquiryClick = (inquiryId: string) => {
    // Close sidebar when opening inquiry panel
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
    selectInquiry(inquiryId);
  };

  // Function to close inquiry panel
  const handleClosePanel = () => {
    closePanel();
  };

  // Listen for sidebar open events to close inquiry panel
  useEffect(() => {
    if (sidebarOpen && selectedInquiryId) {
      // Close inquiry panel when sidebar opens
      closePanel();
    }
  }, [sidebarOpen, selectedInquiryId, closePanel]);

  // Handle payment success notification
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      toast.success("Subscription activated successfully! Welcome to Spaak!");
      // Clear the query parameter by replacing the URL
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [searchParams]);

  // Handle errors
  useEffect(() => {
    if (inquiriesError) {
      console.error("Error fetching inquiries:", inquiriesError);
      toast.error("Failed to load inquiries");
    }
  }, [inquiriesError]);

  // Create inquiries result object for compatibility with existing DataTable
  const inquiriesResult = {
    data: inquiries,
    error: inquiriesError,
  };


  // Compute analytics metrics
  const analytics = {
    new: inquiries.filter((inq) => inq.status === "new").length,
    contacted: inquiries.filter((inq) => inq.status === "contacted").length,
    scheduled: inquiries.filter((inq) => inq.status === "scheduled").length,
    completed: inquiries.filter((inq) => inq.status === "completed").length,
    cancelled: inquiries.filter((inq) => inq.status === "cancelled").length,
  };

  // Show all inquiries in the table (not just new ones)
  
  // Debug logging for panel state
  console.log("Panel States:", {
    sidebarOpen,
    inquiryPanelOpen: Boolean(selectedInquiryId),
    selectedInquiryId
  });

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
                <div className="text-2xl font-bold">
                  {inquiriesLoading ? <Skeleton className="h-8 w-8" /> : analytics.new}
                </div>
              </div>
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="tracking-tight text-sm font-medium">Contacted</h3>
                  <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">
                  {inquiriesLoading ? <Skeleton className="h-8 w-8" /> : analytics.contacted}
                </div>
              </div>
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="tracking-tight text-sm font-medium">Scheduled</h3>
                  <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">
                  {inquiriesLoading ? <Skeleton className="h-8 w-8" /> : analytics.scheduled}
                </div>
              </div>
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="tracking-tight text-sm font-medium">Completed</h3>
                  <TrendingDownIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">
                  {inquiriesLoading ? <Skeleton className="h-8 w-8" /> : analytics.completed}
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">All Inquiries</h3>
                {inquiriesLoading ? (
                  <SkeletonTable />
                ) : (
                  <DataTable data={inquiries} onRowClick={handleInquiryClick} />
                )}
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
