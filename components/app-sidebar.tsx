"use client";

import * as React from "react";
import { ArrowUpCircleIcon, Bot, CameraIcon, FileCodeIcon, FileTextIcon, LayoutDashboardIcon } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { useAuthStore } from "@/stores/auth-store";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { Separator } from "@/components/ui/separator";

import Image from "next/image";
import Link from "next/link";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "AI Assistant",
      url: "/dashboard/assistant",
      icon: Bot,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  //***** GET USER *****//
  const { user, isLoading } = useAuthStore();

  const userInfo = {
    // name: user?.user_metadata?.full_name || user?.email || "Anonymous",
    email: user?.email || "No Email",
    avatar: "/default-avatar.png", // We can add avatar support to the auth store later if needed
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href="#">
                <Image
                  src="/logos/logo-color.png"
                  alt="Spaak Logo"
                  width={32}
                  height={32}
                  className="text-orange-500"
                />
                <span className="text-base font-semibold">Spaak</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <Separator />

      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userInfo} />
      </SidebarFooter>
    </Sidebar>
  );
}
