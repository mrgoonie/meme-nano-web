export const IMGFLIP_API_BASE_URL = 'https://api.imgflip.com'
export const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

export const GEMINI_MODELS = {
  TEXT: 'gemini-2.5-flash',
  IMAGE: 'gemini-2.5-flash-image-preview',
} as const

export const MAX_MEME_COUNT = 4
export const GENERATION_TIMEOUT = 15000 // 15 seconds

export const ERROR_MESSAGES = {
  NO_API_KEY: 'Please set your Gemini API key in Settings',
  INVALID_API_KEY: 'Invalid API key. Please check and try again.',
  GENERATION_FAILED: 'Failed to generate memes. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT: 'Generation timed out. Please try again.',
} as const

export const STORAGE_KEYS = {
  API_KEY: 'meme-nano-api-key',
} as const