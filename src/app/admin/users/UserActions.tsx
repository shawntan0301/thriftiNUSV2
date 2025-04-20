"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { MoreHorizontal, UserCog, Ban, Unlock } from "lucide-react";
import { toast } from "sonner";

interface UserActionsProps {
  userId: string;
  isBanned: boolean;
  onStatusChange?: () => void;
}

export function UserActions({ userId, isBanned, onStatusChange }: UserActionsProps) {
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
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUserId: userId }),
      });

      if (!response.ok) {
        throw new Error(isBanned ? "Failed to unban user" : "Failed to ban user");
      }

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

  return (
    <div className="relative" ref={menuRef}>
      <Button 
        variant="ghost" 
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
      >
        <span className="sr-only">Open menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border bg-background shadow-md">
          <div className="py-1">
            <h3 className="px-3 py-2 text-xs font-medium text-muted-foreground">
              Actions
            </h3>
            <div className="mx-1 my-1 h-px bg-muted"></div>
            <button
              className="flex w-full items-center px-3 py-2 text-sm text-foreground hover:bg-muted"
              onClick={() => {
                setIsOpen(false);
                if (onStatusChange) onStatusChange();
              }}
              disabled={isLoading}
            >
              <UserCog className="mr-2 h-4 w-4" />
              Change Status
            </button>
            <div className="mx-1 my-1 h-px bg-muted"></div>
            <button
              className="flex w-full items-center px-3 py-2 text-sm text-destructive hover:bg-muted"
              onClick={handleBanAction}
              disabled={isLoading}
            >
              {isBanned ? (
                <>
                  <Unlock className="mr-2 h-4 w-4" />
                  {isLoading ? "Unbanning..." : "Unban User"}
                </>
              ) : (
                <>
                  <Ban className="mr-2 h-4 w-4" />
                  {isLoading ? "Banning..." : "Ban User"}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 