"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  onClick?: () => void;
}

export function Logo({ width = 120, height = 120, className = "", onClick }: LogoProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine which icon to use based on theme
  // Light theme = black icon, Dark theme = white icon
  const iconSrc = mounted && (resolvedTheme === "dark" || theme === "dark")
    ? "/white_icon.png"
    : "/black_icon.png";

  return (
    <Image
      src={iconSrc}
      alt="Codebounce Logo"
      width={width}
      height={height}
      className={`object-contain cursor-pointer ${className}`}
      onClick={onClick}
      priority
    />
  );
}

