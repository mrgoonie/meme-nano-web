import { z } from 'zod'

export const promptSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(1000, 'Prompt is too long'),
})

export const analyzeResponseSchema = z.object({
  keywords: z.array(z.string()).min(1),
  captionSets: z.array(
    z.object({
      top: z.string(),
      bottom: z.string(),
    })
  ).min(1),
})

export const apiKeySchema = z.string().regex(/^AIza[0-9A-Za-z-_]{35}$/, 'Invalid Gemini API key format')

export function sanitizePrompt(prompt: string): string {
  return prompt
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove < and >
    .slice(0, 1000) // Limit length
}

export function redactApiKey(key: string): string {
  if (key.length < 8) return '***'
  return `${key.slice(0, 4)}...${key.slice(-4)}`
}