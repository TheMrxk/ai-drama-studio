export interface Project {
  id: string
  name: string
  setting: string
  characters: string
  plot: string
  ending: string
  style: string
  episodes: number
  created_at: string
  updated_at: string
  latest_version?: number
}

export interface ScriptVersion {
  id: string
  project_id: string
  episode: number
  content: string
  version: number
  created_at: string
}

export interface GenerationProgress {
  is_generating: boolean
  progress: number
  current_step: string
  logs: string[]
  result: string | null
  error: string | null
}

export interface User {
  id: string
  username: string
  email: string
}

export interface AuthResponse {
  user: User
  token: string
}
