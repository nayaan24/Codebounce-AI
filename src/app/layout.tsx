import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";
import { stackServerApp } from "@/auth/stack-auth";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pressStart2P = Press_Start_2P({
  variable: "--font-pixelated",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Codebounce",
  description: " AI App Builder",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
  },
  // viewport: {
  //   width: "device-width",
  //   initialScale: 1,
  //   maximumScale: 1,
  //   userScalable: false,
  //   viewportFit: "cover",
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* <head>
        <script
          crossOrigin="anonymous"
          src="//unpkg.com/react-scan/dist/auto.global.js"
        />
      </head> */}
      <body
        className={cn(
          `${geistSans.variable} ${geistMono.variable} ${pressStart2P.variable} antialiased`
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
          forcedTheme="light"
        >
          <Toaster />

          <StackProvider app={stackServerApp}>
            <StackTheme>{children}</StackTheme>
          </StackProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
