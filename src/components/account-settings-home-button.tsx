"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function AccountSettingsHomeButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAccountPage, setIsAccountPage] = useState(false);
  
  useEffect(() => {
    // Check if we're on the account settings page
    // Stack Auth account settings can be at various routes like:
    // /handler/account, /handler/settings, /handler/user, etc.
    // We'll show the home icon for any handler route that's not login/signup
    if (pathname) {
      const isAuthPage = pathname.includes("/login") || 
                        pathname.includes("/signup") || 
                        pathname.includes("/sign-in") ||
                        pathname.includes("/sign-up");
      const isHandlerRoute = pathname.startsWith("/handler");
      setIsAccountPage(isHandlerRoute && !isAuthPage);
    }
  }, [pathname]);

  if (!isAccountPage) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push("/")}
        className="rounded-lg border border-border bg-background/90 backdrop-blur-sm hover:bg-background text-foreground transition-all duration-200 hover:scale-105 shadow-lg"
        title="Go to Home"
      >
        <HomeIcon className="h-5 w-5" />
      </Button>
    </div>
  );
}

