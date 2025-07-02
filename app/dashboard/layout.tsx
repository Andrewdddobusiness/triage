"use client";

import { useAuthStore } from "@/stores/auth-store";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // Use Zustand auth store
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    needsOnboarding,
    needsPostSubscriptionOnboarding,
    onboardingLoading,
    checkOnboarding,
  } = useAuthStore();

  // Add a mounting state to prevent premature redirects
  const [isMounted, setIsMounted] = useState(false);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);

    // Give auth state time to stabilize after mounting
    const timer = setTimeout(() => {
      setAuthCheckComplete(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Handle redirections with useEffect to avoid render-time navigation
  useEffect(() => {
    if (!authCheckComplete || !isMounted) return;

    if (needsOnboarding && user?.id) {
      if (window.location.pathname !== "/subscribe") {
        window.location.href = "/subscribe";
      }
    } else if (needsPostSubscriptionOnboarding && user?.id) {
      if (window.location.pathname !== "/onboarding") {
        window.location.href = "/onboarding";
      }
    }
  }, [needsOnboarding, needsPostSubscriptionOnboarding, user?.id, authCheckComplete, isMounted]);


  // Show loading while component is mounting, auth is loading, or onboarding checks are in progress
  const isLoading = !isMounted || authLoading || onboardingLoading || !authCheckComplete;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting (don't show dashboard until onboarding checks are complete)
  if (needsOnboarding || needsPostSubscriptionOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>{needsOnboarding ? "Redirecting to subscription..." : "Redirecting to onboarding..."}</p>
        </div>
      </div>
    );
  }


  // Main dashboard layout with sidebar
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
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Overview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
