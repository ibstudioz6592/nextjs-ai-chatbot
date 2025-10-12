"use client";

import Image from "next/image";
import type { User as NextAuthUser } from "next-auth";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "./toast";

interface SettingsDialogProps {
  user: NextAuthUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ user, open, onOpenChange }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your account settings and preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Profile Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Profile</h3>
            <div className="flex items-center gap-4">
              <Image
                alt={user.email ?? "User Avatar"}
                className="rounded-full"
                height={64}
                src={`https://avatar.vercel.sh/${user.email}`}
                width={64}
              />
              <div>
                <p className="font-medium">{user.email}</p>
                <p className="text-sm text-muted-foreground">
                  {user.name || "No name set"}
                </p>
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Appearance</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="theme-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark theme
                </p>
              </div>
              <Switch
                id="theme-mode"
                checked={theme === "dark"}
                onCheckedChange={(checked: boolean) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          </div>

          {/* Notifications Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  defaultChecked={false}
                  onCheckedChange={(checked: boolean) => {
                    toast({
                      type: "success",
                      description: checked
                        ? "Email notifications enabled"
                        : "Email notifications disabled",
                    });
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="chat-notifications">Chat Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about new messages
                  </p>
                </div>
                <Switch
                  id="chat-notifications"
                  defaultChecked={true}
                  onCheckedChange={(checked: boolean) => {
                    toast({
                      type: "success",
                      description: checked
                        ? "Chat notifications enabled"
                        : "Chat notifications disabled",
                    });
                  }}
                />
              </div>
            </div>
          </div>

          {/* Privacy Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Privacy & Data</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="save-history">Save Chat History</Label>
                  <p className="text-sm text-muted-foreground">
                    Store your conversations for later
                  </p>
                </div>
                <Switch
                  id="save-history"
                  defaultChecked={true}
                  onCheckedChange={(checked: boolean) => {
                    toast({
                      type: "success",
                      description: checked
                        ? "Chat history will be saved"
                        : "Chat history will not be saved",
                    });
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="analytics">Usage Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Help us improve by sharing usage data
                  </p>
                </div>
                <Switch
                  id="analytics"
                  defaultChecked={true}
                  onCheckedChange={(checked: boolean) => {
                    toast({
                      type: "success",
                      description: checked
                        ? "Analytics enabled"
                        : "Analytics disabled",
                    });
                  }}
                />
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="space-y-4 rounded-lg border border-destructive p-4">
            <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Delete All Chats</Label>
                <p className="text-sm text-muted-foreground">
                  Permanently delete all your chat history
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  toast({
                    type: "error",
                    description: "This feature is coming soon!",
                  });
                }}
              >
                Delete All
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
