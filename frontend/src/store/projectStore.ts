import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Project {
  id: string
  name: string
  setting: string
  characters: string
  plot: string
  ending: string
  episodes: number
  style: string
  status: 'draft' | 'generating' | 'completed'
  created_at: string
  updated_at: string
}

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  searchQuery: string
  filterStyle: string
  setProjects: (projects: Project[]) => void
  setCurrentProject: (project: Project | null) => void
  setSearchQuery: (query: string) => void
  setFilterStyle: (style: string) => void
  addProject: (project: Project) => void
  updateProject: (project: Project) => void
  deleteProject: (id: string) => void
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      projects: [],
      currentProject: null,
      searchQuery: '',
      filterStyle: '',
      setProjects: (projects) => set({ projects }),
      setCurrentProject: (project) => set({ currentProject: project }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilterStyle: (style) => set({ filterStyle: style }),
      addProject: (project) =>
        set((state) => ({ projects: [project, ...state.projects] })),
      updateProject: (project) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === project.id ? project : p
          ),
        })),
      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),
    }),
    {
      name: 'project-storage',
    }
  )
)
