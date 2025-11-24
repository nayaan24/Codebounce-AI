import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserApps } from "@/actions/user-apps";
import { AppCard } from "./app-card";
import { Loader2 } from "lucide-react";
import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export function UserApps() {
  const queryClient = useQueryClient();
  const user = useUser();
  const router = useRouter();
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["userApps"],
    queryFn: getUserApps,
    retry: false, // Don't retry on error (like "User not found")
  });

  const onAppDeleted = () => {
    queryClient.invalidateQueries({ queryKey: ["userApps"] });
  };

  // Check if user is not logged in (error or no user)
  const isNotLoggedIn = !user || (error && error.message?.includes("User not found"));

  // Show loading state while fetching (initial load or refetch) - only if user is logged in
  if (!isNotLoggedIn && (isLoading || (isFetching && data === undefined))) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-3" />
        <p className="text-sm font-medium">Loading Your Projects...</p>
      </div>
    );
  }

  // Show login prompt for logged-out users
  if (isNotLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="max-w-md space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Hey! Please log in or sign up to start using Codebounce!
          </h3>
          <p className="text-sm text-muted-foreground">
            Create amazing apps with AI. Sign up to get started and build your first project.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              onClick={() => router.push("/handler/login")}
              className="rounded-lg border-border bg-primary text-primary-foreground px-6 py-2 text-sm font-normal transition-all duration-200 hover:bg-primary/90 hover:scale-105"
            >
              Log In
            </Button>
            <Button
              onClick={() => router.push("/handler/signup")}
              variant="outline"
              className="rounded-lg border-border bg-secondary text-secondary-foreground px-6 py-2 text-sm font-normal transition-all duration-200 hover:bg-secondary/80 hover:scale-105"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state only after we've confirmed there are no projects (and user is logged in)
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <p className="text-sm">No projects yet. Create your first project above!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {data.map((app) => (
        <AppCard 
          key={app.id}
          id={app.id}
          name={app.name}
          createdAt={app.createdAt}
          previewDomain={app.previewDomain}
          onDelete={onAppDeleted}
        />
      ))}
    </div>
  );
}
