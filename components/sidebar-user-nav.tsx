"use client";

import { 
  ChevronUp, 
  Settings, 
  MessageSquare, 
  CheckSquare, 
  FileText, 
  HelpCircle, 
  GitBranch, 
  Share2, 
  Crown,
  LogOut
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { User } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { guestRegex } from "@/lib/constants";
import { LoaderIcon } from "./icons";
import { SettingsDialog } from "./settings-dialog";
import { toast } from "./toast";

export function SidebarUserNav({ user }: { user: User }) {
  const router = useRouter();
  const { data, status } = useSession();
  const { setTheme, resolvedTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isGuest = guestRegex.test(data?.user?.email ?? "");

  return (
    <>
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {status === "loading" ? (
              <SidebarMenuButton className="h-10 justify-between bg-background data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <div className="flex flex-row gap-2">
                  <div className="size-6 animate-pulse rounded-full bg-zinc-500/30" />
                  <span className="animate-pulse rounded-md bg-zinc-500/30 text-transparent">
                    Loading auth status
                  </span>
                </div>
                <div className="animate-spin text-zinc-500">
                  <LoaderIcon />
                </div>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton
                className="h-10 bg-background data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                data-testid="user-nav-button"
              >
                <Image
                  alt={user.name || user.email || "User"}
                  className="rounded-full object-cover"
                  height={24}
                  src={user.image || `https://avatar.vercel.sh/${user.email}`}
                  width={24}
                  unoptimized
                />
                <span className="truncate" data-testid="user-email">
                  {isGuest ? "Guest" : user?.email}
                </span>
                <ChevronUp className="ml-auto" />
              </SidebarMenuButton>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56"
            data-testid="user-nav-menu"
            side="top"
            align="end"
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="leading-none text-sm font-medium">
                  {isGuest ? "Guest" : user?.email}
                </p>
                <p className="leading-none text-xs text-muted-foreground">
                  {isGuest ? "Sign in to save your chats" : "Manage your account"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => toast({ type: "success", description: "Report issue feature coming soon!" })}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Report Issue</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => toast({ type: "success", description: "Tasks feature coming soon!" })}
            >
              <CheckSquare className="mr-2 h-4 w-4" />
              <span>Tasks</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => toast({ type: "success", description: "Files feature coming soon!" })}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Files</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => toast({ type: "success", description: "FAQ coming soon!" })}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>FAQ</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => toast({ type: "success", description: "Changelog coming soon!" })}
            >
              <GitBranch className="mr-2 h-4 w-4" />
              <span>Changelog</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => toast({ type: "success", description: "Shared links feature coming soon!" })}
            >
              <Share2 className="mr-2 h-4 w-4" />
              <span>Shared Links</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => toast({ type: "success", description: "Upgrade plans coming soon!" })}
            >
              <Crown className="mr-2 h-4 w-4 text-yellow-500" />
              <span>Upgrade Plan</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem
              className="cursor-pointer"
              data-testid="user-nav-item-theme"
              onSelect={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
            >
              {`Toggle ${resolvedTheme === "light" ? "dark" : "light"} mode`}
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem asChild data-testid="user-nav-item-auth">
              <button
                className="w-full cursor-pointer"
                onClick={() => {
                  if (status === "loading") {
                    toast({
                      type: "error",
                      description:
                        "Checking authentication status, please try again!",
                    });

                    return;
                  }

                  if (isGuest) {
                    router.push("/login");
                  } else {
                    signOut({
                      redirectTo: "/",
                    });
                  }
                }}
                type="button"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isGuest ? "Login to your account" : "Sign out"}
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
    
    <SettingsDialog user={user} open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
