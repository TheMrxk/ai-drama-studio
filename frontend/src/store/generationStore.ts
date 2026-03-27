import { create } from 'zustand'

interface GenerationState {
  isGenerating: boolean
  progress: number
  currentStep: string
  logs: string[]
  result: string | null
  error: string | null
  startGeneration: () => void
  updateProgress: (progress: number, step?: string) => void
  addLog: (log: string) => void
  completeGeneration: (result: string) => void
  failGeneration: (error: string) => void
  reset: () => void
}

export const useGenerationStore = create<GenerationState>()((set) => ({
  isGenerating: false,
  progress: 0,
  currentStep: '',
  logs: [],
  result: null,
  error: null,
  startGeneration: () =>
    set({
      isGenerating: true,
      progress: 0,
      currentStep: '准备生成...',
      logs: ['开始生成剧本...'],
      result: null,
      error: null,
    }),
  updateProgress: (progress, step) =>
    set({
      progress,
      currentStep: step || '',
    }),
  addLog: (log) =>
    set((state) => ({
      logs: [...state.logs, log],
    })),
  completeGeneration: (result) =>
    set({
      isGenerating: false,
      progress: 100,
      currentStep: '生成完成',
      result,
      logs: [...state.logs, '生成完成！'],
    }),
  failGeneration: (error) =>
    set({
      isGenerating: false,
      error,
      logs: [...state.logs, `错误：${error}`],
    }),
  reset: () =>
    set({
      isGenerating: false,
      progress: 0,
      currentStep: '',
      logs: [],
      result: null,
      error: null,
    }),
}))
