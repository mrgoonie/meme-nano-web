import { IMGFLIP_API_BASE_URL } from '@/lib/config/constants'
import type { ImgflipSearchResponse, MemeTemplate } from '@/lib/types'

export async function searchMemeTemplates(keywords: string[]): Promise<MemeTemplate[]> {
  try {
    // Imgflip doesn't have a direct search API, so we get popular memes
    // and filter them based on keywords
    const response = await fetch(`${IMGFLIP_API_BASE_URL}/get_memes`)

    if (!response.ok) {
      throw new Error('Failed to fetch meme templates')
    }

    const data: ImgflipSearchResponse = await response.json()

    if (!data.success) {
      throw new Error('Imgflip API returned error')
    }

    // Filter templates based on keywords
    const lowerKeywords = keywords.map(k => k.toLowerCase())
    const filteredMemes = data.data.memes.filter(meme => {
      const memeName = meme.name.toLowerCase()
      return lowerKeywords.some(keyword => memeName.includes(keyword))
    })

    // If filtered results are empty, return top popular memes
    if (filteredMemes.length === 0) {
      return data.data.memes.slice(0, 10)
    }

    return filteredMemes.slice(0, 10)
  } catch (error) {
    console.error('Error searching meme templates:', error)
    throw error
  }
}