"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { MoreHorizontal, Ban, Unlock, Shield } from "lucide-react";
import { toast } from "sonner";

interface UserActionsProps {
  userId: string;
  isBanned: boolean;
  isAdmin?: boolean;
  onStatusChange?: () => void;
}

export function UserActions({ userId, isBanned, isAdmin, onStatusChange }: UserActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleBanAction = async () => {
    try {
      setIsLoading(true);
      const endpoint = isBanned ? "/api/admin/unban-user" : "/api/admin/ban-user";
      console.log("Sending request to:", endpoint, { targetUserId: userId });
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUserId: userId }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Ban action failed:", errorData);
        throw new Error(isBanned ? "Failed to unban user" : "Failed to ban user");
      }

      const result = await response.json();
      console.log("Ban action result:", result);

      toast.success(isBanned ? "User has been unbanned successfully" : "User has been banned successfully");
      setIsOpen(false);
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error("Error in ban action:", error);
      toast.error(isBanned ? "Failed to unban user. Please try again." : "Failed to ban user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMakeAdmin = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/set-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetUserId: userId }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Make admin action failed:", errorData);
        throw new Error("Failed to make user admin");
      }

      const result = await response.json();
      console.log("Make admin result:", result);

      toast.success("User has been made an admin successfully");
      setIsOpen(false);
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error("Error in make admin action:", error);
      toast.error("Failed to make user admin. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1 w-48 rounded-md border bg-white shadow-lg">
          <div className="py-1">
            {!isAdmin && (
              <button
                onClick={handleMakeAdmin}
                disabled={isLoading}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Shield className="mr-2 h-4 w-4 text-blue-500" />
                Make Admin
              </button>
            )}
            <button
              onClick={handleBanAction}
              disabled={isLoading}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {isBanned ? (
                <>
                  <Unlock className="mr-2 h-4 w-4 text-green-500" />
                  Unban User
                </>
              ) : (
                <>
                  <Ban className="mr-2 h-4 w-4 text-red-500" />
                  Ban User
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 