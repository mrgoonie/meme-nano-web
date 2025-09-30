'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, Share2 } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAppStore } from '@/lib/store/app-store'

export default function ResultsPage() {
  const router = useRouter()
  const { generatedMemes } = useAppStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Redirect to home if no memes
    if (mounted && generatedMemes.length === 0) {
      router.push('/home')
    }
  }, [mounted, generatedMemes.length, router])

  const handleBack = () => {
    router.push('/home')
  }

  const handleDownload = async (meme: typeof generatedMemes[0]) => {
    try {
      const response = await fetch(meme.imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `meme-${meme.id}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const handleShare = async (meme: typeof generatedMemes[0]) => {
    try {
      if (navigator.share) {
        // Use Web Share API if available
        const response = await fetch(meme.imageUrl)
        const blob = await response.blob()
        const file = new File([blob], `meme-${meme.id}.jpg`, { type: 'image/jpeg' })

        await navigator.share({
          title: 'MemeNano Generated Meme',
          text: 'Check out this meme I created with MemeNano!',
          files: [file],
        })
      } else {
        // Fallback: Copy image URL to clipboard
        await navigator.clipboard.writeText(meme.imageUrl)
        alert('Image URL copied to clipboard!')
      }
    } catch (error) {
      console.error('Share failed:', error)
    }
  }

  if (!mounted) {
    return null
  }

  if (generatedMemes.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8">
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
          <h1 className="text-2xl font-bold">Results</h1>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {generatedMemes.map((meme) => (
            <Card key={meme.id} className="overflow-hidden">
              <div className="relative aspect-square bg-muted">
                <Image
                  src={meme.imageUrl}
                  alt={`Generated meme ${meme.id}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="p-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleDownload(meme)}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleShare(meme)}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Try Again Button */}
        <div className="mt-8 text-center">
          <Button onClick={handleBack} size="lg">
            Try Another
          </Button>
        </div>
      </div>
    </div>
  )
}