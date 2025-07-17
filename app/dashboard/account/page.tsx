import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { BreadcrumbHeader } from "@/components/dashboard/breadcrumb-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserIcon, MailIcon, BuildingIcon, CalendarIcon } from "lucide-react";

export default async function AccountPage() {
  const supabase = await createClient();

  // Redirect if not logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch service provider information
  const { data: serviceProvider, error } = await supabase
    .from("service_providers")
    .select("owner_name, business_name, business_email, onboarding_status")
    .eq("auth_user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching service provider:", error);
  }

  // Extract user information with service provider data
  const userInfo = {
    name: serviceProvider?.owner_name || "Not provided",
    email: user.email || "Not provided",
    businessName: serviceProvider?.business_name || "Not provided",
    avatar: user.user_metadata?.avatar_url || "/default-avatar.png",
    createdAt: new Date(user.created_at).toLocaleDateString(),
    lastSignIn: user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "Never",
    emailVerified: user.email_confirmed_at ? true : false,
    onboardingStatus: serviceProvider?.onboarding_status || "pending",
  };

  return (
    <>
      <BreadcrumbHeader currentPage="Account" />
      <div className="grid auto-rows-min gap-4 md:grid-cols-3 px-4">
        {/* Profile Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Your account details and personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={userInfo.avatar} alt={userInfo.name} />
                <AvatarFallback className="text-lg">
                  {userInfo.name && userInfo.name !== "Not provided" ? userInfo.name.charAt(0).toUpperCase() : "N"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{userInfo.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant={userInfo.emailVerified ? "default" : "secondary"}>
                    {userInfo.emailVerified ? "Verified" : "Unverified"}
                  </Badge>
                  <Badge variant={userInfo.onboardingStatus === "completed" ? "default" : "outline"}>
                    {userInfo.onboardingStatus === "completed" ? "Setup Complete" : "Setup Pending"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{userInfo.name}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email Address</label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <MailIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{userInfo.email}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Business Name</label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <BuildingIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{userInfo.businessName}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <span className="text-sm">••••••••</span>
                  <a href="/dashboard/reset-password" className="ml-auto text-sm text-primary hover:text-primary/90">
                    Change
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Member Since</label>
              <p className="text-sm">{userInfo.createdAt}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Last Sign In</label>
              <p className="text-sm">{userInfo.lastSignIn}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email Status</label>
              <div>
                <Badge variant={userInfo.emailVerified ? "default" : "destructive"}>
                  {userInfo.emailVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
