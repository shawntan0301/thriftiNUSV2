"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { MoreHorizontal, UserCog, Ban } from "lucide-react";

export function UserActions() {
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <div className="relative" ref={menuRef}>
      <Button 
        variant="ghost" 
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => setIsOpen(!isOpen)}
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
              onClick={() => setIsOpen(false)}
            >
              <UserCog className="mr-2 h-4 w-4" />
              Change Status
            </button>
            <div className="mx-1 my-1 h-px bg-muted"></div>
            <button
              className="flex w-full items-center px-3 py-2 text-sm text-destructive hover:bg-muted"
              onClick={() => setIsOpen(false)}
            >
              <Ban className="mr-2 h-4 w-4" />
              Ban User
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 