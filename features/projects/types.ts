export interface Project {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface NewProjectInput {
  name: string;
  color: string;
}

/** Friendly palette for new projects (theme-independent hex). */
export const PROJECT_COLORS = ['#6C5CE7', '#3FB6A8', '#FF8A80', '#F4C95D', '#1E8A5F', '#9A8BFF'];
