import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppState } from '@/lib/types'
import { STORAGE_KEYS } from '@/lib/config/constants'

const initialGenerationState = {
  isGenerating: false,
  progress: 0,
  currentStep: '',
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      apiKey: null,
      generatedMemes: [],
      generationState: initialGenerationState,

      setApiKey: (key: string) => {
        set({ apiKey: key })
      },

      setGeneratedMemes: (memes) => {
        set({ generatedMemes: memes })
      },

      setGenerationState: (state) => {
        set((prev) => ({
          generationState: { ...prev.generationState, ...state },
        }))
      },

      resetGenerationState: () => {
        set({ generationState: initialGenerationState })
      },
    }),
    {
      name: STORAGE_KEYS.API_KEY,
      partialize: (state) => ({ apiKey: state.apiKey }),
    }
  )
)