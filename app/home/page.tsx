'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAppStore } from '@/lib/store/app-store'
import { ERROR_MESSAGES } from '@/lib/config/constants'

export default function HomePage() {
  const router = useRouter()
  const { apiKey, setGenerationState, resetGenerationState, setGeneratedMemes } = useAppStore()
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    setError('')

    // Validate API key
    if (!apiKey) {
      setError(ERROR_MESSAGES.NO_API_KEY)
      return
    }

    // Validate prompt
    if (!prompt.trim()) {
      setError('Please enter a meme idea')
      return
    }

    setIsGenerating(true)
    resetGenerationState()
    setGenerationState({ isGenerating: true, progress: 10, currentStep: 'Analyzing prompt...' })

    try {
      // Step 1: Analyze prompt and search templates
      const analyzeResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ prompt }),
      })

      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json()
        throw new Error(errorData.error || 'Failed to analyze prompt')
      }

      const { keywords, captions } = await analyzeResponse.json()
      setGenerationState({ progress: 30, currentStep: 'Searching meme templates...' })

      // Step 2: Search for templates
      const templatesResponse = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keywords }),
      })

      if (!templatesResponse.ok) {
        throw new Error('Failed to fetch templates')
      }

      const { templates } = await templatesResponse.json()
      setGenerationState({ progress: 50, currentStep: 'Generating memes...' })

      // Step 3: Generate memes
      const generateResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          templates: templates.slice(0, 4),
          captions,
          prompt,
        }),
      })

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json()
        throw new Error(errorData.error || 'Failed to generate memes')
      }

      const { memes } = await generateResponse.json()
      setGenerationState({ progress: 100, currentStep: 'Complete!' })
      setGeneratedMemes(memes)

      // Navigate to results
      router.push('/results')
    } catch (err) {
      console.error('Generation error:', err)
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.GENERATION_FAILED)
      resetGenerationState()
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSettingsClick = () => {
    router.push('/settings')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            MemeNano
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSettingsClick}
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-6">
          {/* Prompt Input */}
          <div className="space-y-2">
            <label htmlFor="prompt" className="text-sm font-medium sr-only">
              Describe your meme idea
            </label>
            <Textarea
              id="prompt"
              placeholder="Describe your meme idea here...&#10;e.g., 'When you deploy code to production on Friday afternoon'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              className="min-h-[200px] text-base resize-none"
              aria-describedby="prompt-description"
            />
            <p id="prompt-description" className="text-sm text-muted-foreground">
              AI will automatically find templates and create captions for you
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
              {error === ERROR_MESSAGES.NO_API_KEY && (
                <Button
                  variant="link"
                  className="h-auto p-0 mt-2 text-destructive"
                  onClick={handleSettingsClick}
                >
                  Go to Settings
                </Button>
              )}
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            size="lg"
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate
              </>
            )}
          </Button>

          {/* API Key Warning */}
          {!apiKey && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Please set your API key in Settings to start generating memes
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}