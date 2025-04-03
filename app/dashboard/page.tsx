import { AppSidebar } from "@/components/app-sidebar";
import {
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  Breadcrumb,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { DataTable } from "@/components/data-table/table";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react"; // for the trending icons

export default async function ProtectedPage() {
  const supabase = await createClient();

  // Redirect if not logged in.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch all customer inquiries.
  const { data: inquiries, error } = await supabase.from("customer_inquiries").select("*");
  if (error) {
    console.error("Error fetching inquiries:", error.message);
  }
  const allInquiries = inquiries || [];

  // Compute analytics metrics.
  const analytics = {
    new: allInquiries.filter((inq) => inq.status === "new").length,
    contacted: allInquiries.filter((inq) => inq.status === "contacted").length,
    scheduled: allInquiries.filter((inq) => inq.status === "scheduled").length,
    completed: allInquiries.filter((inq) => inq.status === "completed").length,
    cancelled: allInquiries.filter((inq) => inq.status === "cancelled").length,
  };

  // Filter new inquiries for the table.
  const newInquiries = allInquiries.filter((inq) => inq.status === "new");

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Orange-themed analytics cards */}
          <div className="grid auto-rows-min gap-4 md:grid-cols-5 px-6">
            {/* Card: New Inquiries */}
            <div className="flex flex-col items-start justify-between rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white shadow">
              <div className="flex w-full items-center justify-between">
                <p className="text-sm font-medium opacity-90">New Inquiries</p>
                {/* <TrendingUpIcon className="h-5 w-5 text-white" /> */}
              </div>
              <div className="mt-2 text-3xl font-bold">{analytics.new}</div>
              {/* Placeholder for trending percentage */}
              {/* <p className="mt-1 text-xs text-white/80">+5.2% from last week</p> */}
            </div>

            {/* Card: Contacted */}
            <div className="flex flex-col items-start justify-between rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white shadow">
              <div className="flex w-full items-center justify-between">
                <p className="text-sm font-medium opacity-90">Contacted</p>
                {/* <TrendingUpIcon className="h-5 w-5 text-white" /> */}
              </div>
              <div className="mt-2 text-3xl font-bold">{analytics.contacted}</div>
              {/* <p className="mt-1 text-xs text-white/80">+2.1% from last week</p> */}
            </div>

            {/* Card: Scheduled */}
            <div className="flex flex-col items-start justify-between rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white shadow">
              <div className="flex w-full items-center justify-between">
                <p className="text-sm font-medium opacity-90">Scheduled</p>
                {/* <TrendingUpIcon className="h-5 w-5 text-white" /> */}
              </div>
              <div className="mt-2 text-3xl font-bold">{analytics.scheduled}</div>
              {/* <p className="mt-1 text-xs text-white/80">+1.8% from last week</p> */}
            </div>

            {/* Card: Completed */}
            <div className="flex flex-col items-start justify-between rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white shadow">
              <div className="flex w-full items-center justify-between">
                <p className="text-sm font-medium opacity-90">Completed</p>
                {/* <TrendingUpIcon className="h-5 w-5 text-white" /> */}
              </div>
              <div className="mt-2 text-3xl font-bold">{analytics.completed}</div>
              {/* <p className="mt-1 text-xs text-white/80">+0.9% from last week</p> */}
            </div>

            {/* Card: Cancelled */}
            <div className="flex flex-col items-start justify-between rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white shadow">
              <div className="flex w-full items-center justify-between">
                <p className="text-sm font-medium opacity-90">Cancelled</p>
                {/* <TrendingUpIcon className="h-5 w-5 text-white" /> */}
              </div>
              <div className="mt-2 text-3xl font-bold">{analytics.cancelled}</div>
              {/* <p className="mt-1 text-xs text-white/80">+0.4% from last week</p> */}
            </div>
          </div>

          {/* Customer Inquiries Table (showing only 'new' inquiries) */}
          <DataTable data={newInquiries} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
