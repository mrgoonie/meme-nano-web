'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Key, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/lib/store/app-store'

export default function SettingsPage() {
  const router = useRouter()
  const { apiKey, setApiKey } = useAppStore()
  const [localApiKey, setLocalApiKey] = useState(apiKey || '')
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = () => {
    const trimmedKey = localApiKey.trim()
    if (trimmedKey) {
      setApiKey(trimmedKey)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    }
  }

  const handleBack = () => {
    router.push('/home')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        {/* API Key Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Gemini API Key
            </CardTitle>
            <CardDescription>
              Your API key is stored securely in your browser and never sent to our servers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="api-key" className="text-sm font-medium">
                API Key
              </label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your Gemini API key"
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                className="font-mono"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={!localApiKey.trim()}
              className="w-full"
            >
              {isSaved ? 'Saved!' : 'Save API Key'}
            </Button>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-muted rounded-lg space-y-3">
              <h3 className="font-semibold text-sm">How to get your API key:</h3>
              <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                <li>Visit Google AI Studio</li>
                <li>Sign in with your Google account</li>
                <li>Click &quot;Get API Key&quot; button</li>
                <li>Create a new API key</li>
                <li>Copy and paste it above</li>
              </ol>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                Open Google AI Studio
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}