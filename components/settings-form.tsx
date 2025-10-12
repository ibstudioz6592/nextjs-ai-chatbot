"use client";

import { User } from "lucide-react";
import Image from "next/image";
import type { User as NextAuthUser } from "next-auth";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "./toast";

export function SettingsForm({ user }: { user: NextAuthUser }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      {/* Appearance Section */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how the app looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage your notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              onCheckedChange={(checked) => {
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
              onCheckedChange={(checked) => {
                toast({
                  type: "success",
                  description: checked
                    ? "Chat notifications enabled"
                    : "Chat notifications disabled",
                });
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Section */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy & Data</CardTitle>
          <CardDescription>Control your data and privacy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              onCheckedChange={(checked) => {
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
              onCheckedChange={(checked) => {
                toast({
                  type: "success",
                  description: checked
                    ? "Analytics enabled"
                    : "Analytics disabled",
                });
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Delete All Chats</Label>
              <p className="text-sm text-muted-foreground">
                Permanently delete all your chat history
              </p>
            </div>
            <Button
              variant="destructive"
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
        </CardContent>
      </Card>
    </div>
  );
}
