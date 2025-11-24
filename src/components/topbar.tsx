import {
  ArrowUpRightIcon,
  ComputerIcon,
  GlobeIcon,
  HomeIcon,
  TerminalIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { ModeToggle } from "./theme-provider";
import { Logo } from "./logo";
import { requestDevServer } from "./webview-actions";

export function TopBar({
  appName,
  children,
  repoId,
  consoleUrl,
  codeServerUrl,
}: {
  appName: string;
  children?: React.ReactNode;
  repoId: string;
  consoleUrl?: string;
  codeServerUrl?: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const [devServerUrls, setDevServerUrls] = useState<{
    codeServerUrl?: string;
    consoleUrl?: string;
  }>({ codeServerUrl, consoleUrl });
  const [isLoadingUrls, setIsLoadingUrls] = useState(!codeServerUrl || !consoleUrl);

  // Fetch dev server URLs in the background if not provided
  useEffect(() => {
    if (!codeServerUrl || !consoleUrl) {
      requestDevServer({ repoId })
        .then((result) => {
          setDevServerUrls({
            codeServerUrl: result.codeServerUrl,
            consoleUrl: result.ephemeralUrl ? result.ephemeralUrl + "/__console" : undefined,
          });
          setIsLoadingUrls(false);
        })
        .catch((error) => {
          console.error("Failed to fetch dev server URLs:", error);
          setIsLoadingUrls(false);
        });
    }
  }, [codeServerUrl, consoleUrl, repoId]);

  const finalCodeServerUrl = codeServerUrl || devServerUrls.codeServerUrl;
  const finalConsoleUrl = consoleUrl || devServerUrls.consoleUrl;

  return (
    <div className="h-12 sticky top-0 flex items-center px-4 border-b border-border bg-background justify-between">
      <div className="flex items-center gap-3">
        {/* Logo size: adjust width/height values (currently 24x24) */}
        {/* Logo padding: add padding classes to className prop (e.g., "p-1", "px-2 py-1") */}
        <Logo 
          width={60} 
          height={60} 
          className="" 
          onClick={() => router.push("/")} 
        />
        {/* Spacing between logo and home icon: adjust gap-3 value above */}
        <Link href={"/"}>
          <HomeIcon className="h-5 w-5" />
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <ModeToggle />
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant={"ghost"}>
            <img
              src="/logos/vscode.svg"
              className="h-4 w-4"
              alt="VS Code Logo"
            />
            {/* <img
              src="/logos/cursor.png"
              className="h-4 w-4"
              alt="Cursor Logo"
            /> */}
            <TerminalIcon className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Open In</DialogTitle>
          </DialogHeader>
          <div>
            <div className="flex flex-col gap-2 pb-4">
              <div className="font-bold mt-4 flex items-center gap-2">
                <GlobeIcon className="inline h-4 w-4 ml-1" />
                Browser
              </div>
              <div>
                {finalCodeServerUrl ? (
                  <a href={finalCodeServerUrl} target="_blank" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full flex justify-between items-center"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src="/logos/vscode.svg"
                          className="h-4 w-4"
                          alt="VS Code Logo"
                        />
                        <span>VS Code</span>
                      </div>
                      <ArrowUpRightIcon className="h-4 w-4" />
                    </Button>
                  </a>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full flex justify-between items-center"
                    disabled
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src="/logos/vscode.svg"
                        className="h-4 w-4"
                        alt="VS Code Logo"
                      />
                      <span>VS Code</span>
                    </div>
                    {isLoadingUrls && <span className="text-xs">Loading...</span>}
                  </Button>
                )}
                <p className="text-xs text-muted-foreground mt-1 px-1">
                  Note: VSCode server may take 30-60 seconds to load initially
                </p>
              </div>
              <div>
                {finalConsoleUrl ? (
                  <a href={finalConsoleUrl} target="_blank" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full flex justify-between items-center"
                    >
                      <div className="flex items-center gap-2">
                        <TerminalIcon className="h-4 w-4" />
                        <span>Console</span>
                      </div>
                      <ArrowUpRightIcon className="h-4 w-4" />
                    </Button>
                  </a>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full flex justify-between items-center"
                    disabled
                  >
                    <div className="flex items-center gap-2">
                      <TerminalIcon className="h-4 w-4" />
                      <span>Console</span>
                    </div>
                    {isLoadingUrls && <span className="text-xs">Loading...</span>}
                  </Button>
                )}
              </div>

              {/* <div className="font-bold mt-4 flex items-center gap-2">
                <ComputerIcon className="inline h-4 w-4 ml-1" />
                Local
              </div>

              <div>
                <Button
                  variant="outline"
                  className="w-full flex justify-between items-center"
                  onClick={() => {
                    navigator.clipboard.writeText();
                    setModalOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src="/logos/vscode.svg"
                      className="h-4 w-4"
                      alt="VS Code Logo"
                    />
                    <span>VS Code Remote</span>
                  </div>
                  <span>Copy Command</span>
                </Button>
              </div>

              <div>
                <Button
                  variant="outline"
                  className="w-full flex justify-between items-center"
                  onClick={() => {
                    navigator.clipboard.writeText(`ssh ${}@vm-ssh`);
                    setModalOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <TerminalIcon className="h-4 w-4" />
                    <span>SSH</span>
                  </div>
                  <span>Copy Command</span>
                </Button>
              </div> */}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
