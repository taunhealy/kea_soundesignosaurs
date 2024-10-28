"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { toast } from "react-hot-toast";

export function UsernameSettings() {
  const { user, isLoaded } = useUser();
  const [isUpdating, setIsUpdating] = useState(false);
  const [username, setUsername] = useState(user?.username || "");

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      toast.error("Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch("/api/user/update-username", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update username");
      }

      // Update Clerk user data
      await user?.update({
        username: username,
      });

      toast.success("Username updated successfully");
    } catch (error) {
      console.error("Error updating username:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update username");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Username Settings</h2>
      <form onSubmit={handleUpdateUsername} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            pattern="[a-zA-Z0-9_-]{3,20}"
            title="Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens"
          />
        </div>
        <Button 
          type="submit" 
          disabled={isUpdating || username === user?.username}
        >
          {isUpdating ? "Updating..." : "Update Username"}
        </Button>
      </form>
    </div>
  );
}
