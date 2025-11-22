"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ProjectOpeningContextType {
  isAnyProjectOpening: boolean;
  openingProjectId: string | null;
  setProjectOpening: (projectId: string | null) => void;
}

const ProjectOpeningContext = createContext<ProjectOpeningContextType | undefined>(undefined);

export function ProjectOpeningProvider({ children }: { children: ReactNode }) {
  const [openingProjectId, setOpeningProjectId] = useState<string | null>(null);

  const setProjectOpening = (projectId: string | null) => {
    setOpeningProjectId(projectId);
  };

  return (
    <ProjectOpeningContext.Provider value={{ 
      isAnyProjectOpening: openingProjectId !== null, 
      openingProjectId,
      setProjectOpening 
    }}>
      {children}
    </ProjectOpeningContext.Provider>
  );
}

export function useProjectOpening() {
  const context = useContext(ProjectOpeningContext);
  if (context === undefined) {
    throw new Error("useProjectOpening must be used within a ProjectOpeningProvider");
  }
  return context;
}

