import type { ProjectStatus } from "@/lib/projects.types";

export type ProjectCreateInput = {
  title: string;
  summary?: string;
  content?: string;
  coverUrl?: string;
  category: string;
  place: string;
  area: string;
  funds?: number;
  status?: ProjectStatus;
  published?: boolean;
};

export type ProjectUpdateInput = Partial<ProjectCreateInput>;
