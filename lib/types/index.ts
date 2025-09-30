export interface MemeTemplate {
  id: string
  name: string
  url: string
  width: number
  height: number
  box_count: number
}

export interface MemeCaption {
  text: string
  box_index: number
}

export interface GeneratedMeme {
  id: string
  imageUrl: string
  template: MemeTemplate
  captions: MemeCaption[]
}

export interface ImgflipSearchResponse {
  success: boolean
  data: {
    memes: MemeTemplate[]
  }
}

export interface GenerationState {
  isGenerating: boolean
  progress: number
  currentStep: string
}

export interface AppState {
  apiKey: string | null
  generatedMemes: GeneratedMeme[]
  generationState: GenerationState
  setApiKey: (key: string) => void
  setGeneratedMemes: (memes: GeneratedMeme[]) => void
  setGenerationState: (state: Partial<GenerationState>) => void
  resetGenerationState: () => void
}