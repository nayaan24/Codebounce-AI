"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Trash, ExternalLink, MoreVertical, Loader2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { deleteApp } from "@/actions/delete-app";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";

type AppCardProps = {
  id: string;
  name: string;
  createdAt: Date;
  previewDomain?: string | null;
  onDelete?: () => void;
};

export function AppCard({ id, name, createdAt, previewDomain, onDelete }: AppCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [previewError, setPreviewError] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const navigationStarted = useRef(false);

  // Reset opening state only when we're actually on the target page (not homepage)
  useEffect(() => {
    if (pathname === `/app/${id}` && navigationStarted.current) {
      // Delay to ensure page has started loading
      const timeout = setTimeout(() => {
        setIsOpening(false);
        navigationStarted.current = false;
      }, 500);
      return () => clearTimeout(timeout);
    }
    // Don't reset if we're still on homepage - keep loading state
  }, [pathname, id]);

  // Fallback: Reset opening state after 15 seconds to prevent stuck state
  useEffect(() => {
    if (isOpening) {
      const timeout = setTimeout(() => {
        setIsOpening(false);
        navigationStarted.current = false;
      }, 15000); // 15 second timeout
      return () => clearTimeout(timeout);
    }
  }, [isOpening]);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isOpening || navigationStarted.current) return; // Prevent multiple clicks
    
    setIsOpening(true);
    navigationStarted.current = true;
    router.push(`/app/${id}`);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isOpening || navigationStarted.current) return;
    
    setIsOpening(true);
    navigationStarted.current = true;
    router.push(`/app/${id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isOpening) return; // Prevent delete while opening
    
    await deleteApp(id);
    toast.success("App deleted successfully");
    if (onDelete) {
      onDelete();
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative group">
      <div
        onClick={handleCardClick}
        className={`bg-black rounded-lg border border-gray-500/30 overflow-hidden transition-all duration-200 ${
          isOpening || navigationStarted.current
            ? "opacity-60 cursor-wait border-gray-600/50 pointer-events-none" 
            : "hover:border-gray-400/50 cursor-pointer"
        }`}
      >
          {/* Preview Section */}
          <div className="h-40 bg-gray-800/50 relative overflow-hidden">
            {isOpening || navigationStarted.current ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-white px-4 text-center">
                <Loader2 className="h-6 w-6 animate-spin mb-2" />
                <div className="text-sm font-semibold">Opening...</div>
              </div>
            ) : previewDomain && !previewError ? (
              <iframe
                src={`https://${previewDomain}`}
                className="w-full h-full border-0"
                onError={() => setPreviewError(true)}
                title={`Preview of ${name}`}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-semibold text-sm px-4 text-center">
                {previewError || !previewDomain ? "SHOW A LIVE PREVIEW HERE" : "Loading preview..."}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-white"></div>

          {/* Info Section */}
          <div className="p-4 space-y-1">
            <div className="text-white text-sm truncate">
              {name}
            </div>
            <div className="text-white text-xs">
              Created at: {formatTime(createdAt)}
            </div>
          </div>
        </div>

      {/* Dropdown Menu */}
      {!isOpening && !navigationStarted.current && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1.5 rounded-md bg-black/80 hover:bg-black/90 text-white border border-white/20 focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700">
              <DropdownMenuItem
                onClick={handleOpen}
                className="text-white hover:bg-gray-800 focus:bg-gray-800"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-400 hover:bg-gray-800 focus:bg-gray-800"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
