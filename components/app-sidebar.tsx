"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "next-auth";
import { motion } from "framer-motion";
import { PlusIcon } from "@/components/icons";
import { SidebarHistory } from "@/components/sidebar-history";
import { SidebarUserNav } from "@/components/sidebar-user-nav";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useDataStream } from "./data-stream-provider";

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const dataStream = useDataStream();
  
  // Check if AI is currently responding
  const isAIResponding = dataStream && dataStream.length > 0;

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row items-center justify-between">
            <Link
              className="flex flex-row items-center gap-3"
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
            >
              <motion.div
                className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 ring-2 ring-offset-2 ring-blue-400 dark:ring-offset-zinc-900"
                animate={isAIResponding ? {
                  boxShadow: [
                    "0 0 0 0 rgba(59, 130, 246, 0.7)",
                    "0 0 0 10px rgba(59, 130, 246, 0)",
                    "0 0 0 0 rgba(59, 130, 246, 0)",
                  ],
                  scale: [1, 1.05, 1],
                } : {}}
                transition={{
                  duration: 1.5,
                  repeat: isAIResponding ? Number.POSITIVE_INFINITY : 0,
                  ease: "easeInOut",
                }}
              >
                <motion.span
                  animate={isAIResponding ? {
                    rotate: [0, 360],
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: isAIResponding ? Number.POSITIVE_INFINITY : 0,
                    ease: "linear",
                  }}
                  className="font-bold text-white text-sm tracking-wider"
                >
                  AJ
                </motion.span>
              </motion.div>
              <span className="cursor-pointer rounded-md px-2 font-semibold text-lg hover:bg-muted">
                AJ STUDIOZ
              </span>
            </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="h-8 p-1 md:h-fit md:p-2"
                  onClick={() => {
                    setOpenMobile(false);
                    router.push("/");
                    router.refresh();
                  }}
                  type="button"
                  variant="ghost"
                >
                  <PlusIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="end" className="hidden md:block">
                New Chat
              </TooltipContent>
            </Tooltip>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarHistory user={user} />
      </SidebarContent>
      <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
