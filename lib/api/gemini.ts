import { GoogleGenerativeAI } from '@google/generative-ai'
import { GEMINI_MODELS } from '@/lib/config/constants'

export async function analyzePromptAndGenerateCaptions(apiKey: string, prompt: string) {
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: GEMINI_MODELS.TEXT })

  const analysisPrompt = `
You are a meme expert. Analyze the following meme idea and provide:
1. 3-5 keywords to search for meme templates
2. 4 sets of captions (each with top and bottom text) that would be funny with this idea

User idea: "${prompt}"

Respond in JSON format:
{
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "captionSets": [
    {"top": "Top text", "bottom": "Bottom text"},
    {"top": "Top text", "bottom": "Bottom text"},
    {"top": "Top text", "bottom": "Bottom text"},
    {"top": "Top text", "bottom": "Bottom text"}
  ]
}
`

  const result = await model.generateContent(analysisPrompt)
  const response = result.response
  const text = response.text()

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response')
  }

  return JSON.parse(jsonMatch[0])
}

export async function generateMemeImage(
  apiKey: string,
  templateUrl: string,
  topText: string,
  bottomText: string,
  prompt: string
) {
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: GEMINI_MODELS.IMAGE })

  const imagePrompt = `
Take this meme template image and add text to it to create a meme:
- Top text: "${topText}"
- Bottom text: "${bottomText}"

Instructions:
- Add the text in classic meme font (Impact font style, white text with black stroke)
- Position top text at the top center of the image
- Position bottom text at the bottom center of the image
- Make sure text is clearly visible and readable
- Maintain the original image quality and aspect ratio
- The text should be large enough to read but not overwhelming

Generate the complete meme image with the text added.
`

  // Fetch the template image
  const imageResponse = await fetch(templateUrl)
  const imageBlob = await imageResponse.blob()
  const imageBuffer = await imageBlob.arrayBuffer()
  const imageBase64 = Buffer.from(imageBuffer).toString('base64')

  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType: 'image/jpeg',
    },
  }

  const result = await model.generateContent([imagePrompt, imagePart])
  const response = result.response

  // Get the generated image
  if (response.candidates && response.candidates[0]) {
    const candidate = response.candidates[0]
    if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
      const part = candidate.content.parts[0]
      if ('inlineData' in part && part.inlineData) {
        return part.inlineData.data
      }
    }
  }

  throw new Error('Failed to generate meme image')
}