import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserApps } from "@/actions/user-apps";
import { AppCard } from "./app-card";
import { Loader2 } from "lucide-react";

export function UserApps() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["userApps"],
    queryFn: getUserApps,
    initialData: [],
  });

  const onAppDeleted = () => {
    queryClient.invalidateQueries({ queryKey: ["userApps"] });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-white/60">
        <Loader2 className="h-8 w-8 animate-spin mb-3" />
        <p className="text-sm font-medium">Loading projects...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-white/40">
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
