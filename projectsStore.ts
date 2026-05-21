import { create } from 'zustand';

import { deleteProject, insertProject, listProjects } from '@/db/projectsRepo';
import type { NewProjectInput, Project } from '@/features/projects/types';

interface ProjectsState {
  projects: Project[];
  loaded: boolean;
  load: () => Promise<void>;
  addProject: (input: NewProjectInput) => Promise<Project>;
  removeProject: (id: string) => Promise<void>;
}

export const useProjectsStore = create<ProjectsState>((set) => ({
  projects: [],
  loaded: false,

  load: async () => {
    const projects = await listProjects();
    set({ projects, loaded: true });
  },

  addProject: async (input) => {
    const project = await insertProject(input);
    set((state) => ({ projects: [...state.projects, project] }));
    return project;
  },

  removeProject: async (id) => {
    await deleteProject(id);
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }));
  },
}));
