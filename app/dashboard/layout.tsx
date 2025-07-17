"use client";

import { useAuthStore } from "@/stores/auth-store";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode, useEffect, useState } from "react";
import { AssistantSetupModal } from "@/components/modals/assistant-setup-modal";
import { getSetupFlags, updateSetupFlags } from "@/app/actions/update-setup-flags";
import { SidebarInset } from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // Use Zustand auth store
  const {
    user,
    isLoading: authLoading,
    needsOnboarding,
    needsPostSubscriptionOnboarding,
    onboardingLoading,
  } = useAuthStore();

  // Add a mounting state to prevent premature redirects
  const [isMounted, setIsMounted] = useState(false);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [setupCheckComplete, setSetupCheckComplete] = useState(false);

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

  // Check for first-time setup after onboarding is complete
  useEffect(() => {
    if (!authCheckComplete || !user?.id || needsOnboarding || needsPostSubscriptionOnboarding || setupCheckComplete) {
      return;
    }

    const checkFirstTimeSetup = async () => {
      try {
        const result = await getSetupFlags();

        if (result.success && result.flags) {
          const { has_seen_assistant_setup } = result.flags;

          // Show modal if user hasn't seen assistant setup
          const needsSetup = !has_seen_assistant_setup;

          if (needsSetup) {
            // Add a delay for smooth page load
            setTimeout(async () => {
              setShowSetupModal(true);

              // Mark as seen immediately when modal is shown
              try {
                await updateSetupFlags({ has_seen_assistant_setup: true });
              } catch (error) {
                console.error("🏠 Layout: Failed to update setup flag:", error);
              }
            }, 1500); // 1.5s delay for page to fully load
          }
        } else {
          console.error("🏠 Layout: Failed to get setup flags, assuming first-time user");
          // On error, assume first-time user
          setTimeout(async () => {
            setShowSetupModal(true);

            // Mark as seen when modal is shown (error case)
            try {
              await updateSetupFlags({ has_seen_assistant_setup: true });
            } catch (error) {
              console.error("🏠 Layout: Failed to update setup flag (error case):", error);
            }
          }, 1500);
        }
      } catch (error) {
        console.error("🏠 Layout: Error checking first-time setup:", error);
        // On error, assume first-time user
        setTimeout(async () => {
          setShowSetupModal(true);

          // Mark as seen when modal is shown (catch error case)
          try {
            await updateSetupFlags({ has_seen_assistant_setup: true });
          } catch (updateError) {
            console.error("🏠 Layout: Failed to update setup flag (catch error case):", updateError);
          }
        }, 1500);
      } finally {
        setSetupCheckComplete(true);
      }
    };

    checkFirstTimeSetup();
  }, [authCheckComplete, user?.id, needsOnboarding, needsPostSubscriptionOnboarding, setupCheckComplete]);

  // Show loading while component is mounting, auth is loading, or onboarding checks are in progress
  const isLoading = !isMounted || authLoading || onboardingLoading || !authCheckComplete;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
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
        <div className="flex flex-1 flex-col gap-4 pt-0">{children}</div>
      </SidebarInset>

      {/* First-time setup modal */}
      <AssistantSetupModal
        open={showSetupModal}
        onOpenChange={setShowSetupModal}
        isFirstTimeSetup={true}
        onAssistantSelected={() => {
          // Modal will close automatically
        }}
        onPhoneNumberAssigned={() => {
          // Modal will close automatically
        }}
      />
    </SidebarProvider>
  );
}
