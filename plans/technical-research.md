# MemeNano Technical Research Report

**Research Conducted:** September 30, 2025
**Project:** MemeNano - AI-Powered Meme Generator

---

## Executive Summary

This comprehensive technical research document covers all key technologies and requirements for building the MemeNano project: a modern web application that leverages Next.js 15, React 19, Google Gemini API, Imgflip API, shadcn/ui, and Zustand for an AI-powered meme generation experience. The research synthesizes official documentation, current best practices, security considerations, and implementation patterns from authoritative sources across the web development ecosystem.

**Key Findings:**
- Next.js 15 with React 19 provides a mature, production-ready foundation with Server Components and App Router
- Google Gemini 2.5 Flash models offer powerful text generation and image editing capabilities with generous free tier limits
- Imgflip API provides access to 1M+ meme templates with straightforward integration
- shadcn/ui offers production-ready, accessible UI components with full Next.js 15 compatibility
- Zustand provides lightweight, type-safe state management ideal for Next.js App Router
- Web Share API has broad mobile support with clear fallback strategies
- Security best practices are well-established for API key management, rate limiting, and input sanitization

---

## Table of Contents

1. [Next.js 15 & React 19](#nextjs-15--react-19)
2. [Imgflip API](#imgflip-api)
3. [Google Gemini API](#google-gemini-api)
4. [shadcn/ui](#shadcnui)
5. [Zustand State Management](#zustand-state-management)
6. [Web Share API](#web-share-api)
7. [Security Best Practices](#security-best-practices)
8. [Implementation Roadmap](#implementation-roadmap)
9. [Resources & References](#resources--references)

---

## Next.js 15 & React 19

### Technology Overview

**Next.js 15** is the latest stable version (as of 2025) of Vercel's React framework, featuring enhanced App Router capabilities, improved TypeScript support, and React 19 integration. **React 19** was officially released as stable in December 2024, introducing Actions, stable Server Components, and new hooks for modern application development.

### Current State & Features

#### Next.js 15 Key Features

1. **App Router (Production Ready)**
   - Server Components by default
   - Enhanced routing with improved file conventions
   - Automatic code splitting and optimized bundle sizes
   - Support for parallel routes and intercepting routes

2. **React 19 Integration**
   - Full support for React Server Components
   - Actions for form handling and data mutations
   - New hooks: `useActionState`, `useOptimistic`, `useFormStatus`
   - Improved automatic batching for better performance

3. **TypeScript Enhancements (Next.js 15.5)**
   - Typed routes with automatic route generation
   - Route export validation
   - Environment variable type generation in `.next/types`
   - Enhanced IntelliSense for better developer experience

4. **Performance Improvements**
   - Improved caching strategies with `revalidateTag()`
   - Partial Pre-rendering (PPR) for dynamic content
   - Enhanced Image component with better defaults
   - Edge runtime optimization

### Best Practices for 2025

#### 1. Server vs Client Components

**Golden Rule:** Use Server Components by default, only use Client Components when necessary.

```typescript
// Server Component (default)
// app/page.tsx
export default async function Page() {
  const data = await fetch('https://api.example.com/data')
  const json = await data.json()

  return <div>{json.title}</div>
}

// Client Component (when needed)
// components/counter.tsx
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

**When to use Client Components:**
- Interactive UI with hooks (`useState`, `useEffect`, etc.)
- Event listeners (`onClick`, `onChange`, etc.)
- Browser-only APIs (localStorage, window, etc.)
- Custom hooks
- Class components

**When to use Server Components:**
- Data fetching
- Backend resource access
- Sensitive information (API keys, tokens)
- Large dependencies that don't need client-side JavaScript

#### 2. Project Structure

Recommended folder structure for Next.js 15 App Router:

```
app/
├── layout.tsx              # Root layout
├── page.tsx               # Home page
├── api/                   # API routes
│   └── memes/
│       └── route.ts
├── (routes)/              # Route groups
│   ├── generate/
│   │   └── page.tsx
│   └── gallery/
│       └── page.tsx
components/
├── ui/                    # shadcn/ui components
├── features/              # Feature-specific components
│   ├── meme-generator/
│   └── template-search/
└── layout/                # Layout components
lib/
├── utils.ts               # Utility functions
├── api/                   # API clients
│   ├── imgflip.ts
│   └── gemini.ts
└── stores/                # Zustand stores
public/
├── images/
└── fonts/
```

#### 3. Data Fetching Patterns

**Direct API Calls in Server Components:**

```typescript
// app/templates/page.tsx
async function getTemplates() {
  const res = await fetch('https://api.imgflip.com/get_memes', {
    next: { revalidate: 3600 } // Cache for 1 hour
  })

  if (!res.ok) throw new Error('Failed to fetch templates')
  return res.json()
}

export default async function TemplatesPage() {
  const data = await getTemplates()

  return (
    <div>
      {data.data.memes.map((meme) => (
        <MemeCard key={meme.id} meme={meme} />
      ))}
    </div>
  )
}
```

**API Routes for Sensitive Operations:**

```typescript
// app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Server-side API call with protected keys
    const response = await fetch('https://api.gemini.com/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Generation failed' },
      { status: 500 }
    )
  }
}
```

#### 4. TypeScript Configuration

Optimal `tsconfig.json` for Next.js 15:

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### 5. Context Providers Pattern

For client-side context (like Zustand stores):

```typescript
// app/layout.tsx
import { StoreProvider } from '@/providers/store-provider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  )
}
```

### Common Pitfalls to Avoid

1. **Don't fetch data in Client Components** - Move data fetching to Server Components or API routes
2. **Don't use Context for global state unnecessarily** - Use Server Components for shared layouts instead
3. **Avoid mixing server and client code** - Keep clear boundaries between server and client logic
4. **Don't skip error boundaries** - Implement error.tsx files for graceful error handling
5. **Avoid client-side environment variables for secrets** - Only use `NEXT_PUBLIC_` prefix for non-sensitive data

---

## Imgflip API

### Technology Overview

The Imgflip API provides programmatic access to a database of 1M+ user-generated meme templates, enabling developers to search for templates and generate captioned memes. The API offers both free and premium tiers with various endpoints for meme creation and template discovery.

### API Endpoints & Features

#### 1. Get Memes (Free)

**Endpoint:** `GET https://api.imgflip.com/get_memes`

Returns 100 popular meme templates ordered by usage in the last 30 days.

**Request:**
```typescript
// lib/api/imgflip.ts
export async function getPopularMemes() {
  const response = await fetch('https://api.imgflip.com/get_memes')
  const data = await response.json()

  if (!data.success) {
    throw new Error('Failed to fetch memes')
  }

  return data.data.memes
}
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "memes": [
      {
        "id": "181913649",
        "name": "Drake Hotline Bling",
        "url": "https://i.imgflip.com/30b1gx.jpg",
        "width": 1200,
        "height": 1200,
        "box_count": 2
      }
    ]
  }
}
```

#### 2. Caption Image (Free with Auth)

**Endpoint:** `POST https://api.imgflip.com/caption_image`

Creates a captioned meme from a template.

**Required Parameters:**
- `template_id` - Template ID from get_memes
- `username` - Your Imgflip username
- `password` - Your Imgflip password
- `text0` - Top text
- `text1` - Bottom text (optional)

**TypeScript Implementation:**

```typescript
// lib/api/imgflip.ts
interface CaptionImageParams {
  templateId: string
  text0: string
  text1?: string
  username: string
  password: string
}

export async function captionImage({
  templateId,
  text0,
  text1 = '',
  username,
  password,
}: CaptionImageParams) {
  const formData = new URLSearchParams({
    template_id: templateId,
    username,
    password,
    text0,
    text1,
  })

  const response = await fetch('https://api.imgflip.com/caption_image', {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  const data = await response.json()

  if (!data.success) {
    throw new Error(data.error_message || 'Failed to caption image')
  }

  return {
    url: data.data.url,
    page_url: data.data.page_url,
  }
}
```

#### 3. Search Memes (Premium - $9.99/month)

**Endpoint:** `POST https://api.imgflip.com/search_memes`

Search through 1M+ templates in the Imgflip database.

**Pricing:**
- Base: $9.99/month
- Includes: First 200 searches per month
- Additional: $0.005 per search

**Note for MemeNano:** Consider using the free `get_memes` endpoint for MVP, as it provides 100 popular templates that cover most use cases. Premium search can be added later based on user demand.

### Rate Limits & Authentication

#### Rate Limits

- **Free Tier:** No hard limit, but requests may be throttled if you abuse the API
- **Recommendation:** Implement caching on frontend for better performance
- **Best Practice:** Don't cache results globally on backend for all users (memes are constantly updated)

#### Authentication

**For Testing:**
- Default account: `imgflip_hubot`
- Suitable only for testing purposes

**For Production:**
- Create your own Imgflip account at https://imgflip.com/signup
- Use your username and password in API requests
- Store credentials securely in environment variables

```env
# .env.local
IMGFLIP_USERNAME=your_username
IMGFLIP_PASSWORD=your_password
```

### Best Practices

1. **Caching Strategy**
   ```typescript
   // Cache popular memes for 1 hour
   export const revalidate = 3600

   async function getCachedMemes() {
     const response = await fetch('https://api.imgflip.com/get_memes', {
       next: { revalidate: 3600 }
     })
     return response.json()
   }
   ```

2. **Error Handling**
   ```typescript
   try {
     const meme = await captionImage(params)
     return meme
   } catch (error) {
     if (error instanceof Error) {
       console.error('Imgflip API error:', error.message)
     }
     throw new Error('Failed to generate meme. Please try again.')
   }
   ```

3. **Type Safety**
   ```typescript
   // types/imgflip.ts
   export interface ImgflipMeme {
     id: string
     name: string
     url: string
     width: number
     height: number
     box_count: number
   }

   export interface ImgflipResponse<T> {
     success: boolean
     data: T
     error_message?: string
   }
   ```

4. **Frontend Caching**
   - Implement client-side caching for template lists
   - Store recently used templates in localStorage
   - Use SWR or React Query for automatic refetching

### Common Pitfalls

1. **Don't use default account in production** - Create your own account to avoid rate limiting
2. **Don't store credentials client-side** - Always use API routes for authenticated requests
3. **Don't skip error handling** - Imgflip API can fail, implement proper error states
4. **Don't forget URL encoding** - Special characters in text need proper encoding

---

## Google Gemini API

### Technology Overview

Google's Gemini API provides access to state-of-the-art AI models for text generation and image manipulation. For MemeNano, we'll leverage two key models:

1. **gemini-2.5-flash** - Fast text generation for meme captions
2. **gemini-2.5-flash-image-preview** - Image editing for meme customization

### Models & Capabilities

#### 1. Gemini 2.5 Flash (Text Generation)

**Model ID:** `gemini-2.5-flash` or `gemini-2.5-flash-preview-09-2025`

**Key Features:**
- Optimized for cost-efficiency and high throughput
- 24% reduction in output tokens vs previous versions
- 5% improvement in agentic capabilities (SWE-Bench Verified: 48.9% → 54%)
- Superior instruction following for complex prompts
- Ranks #2 on LMarena leaderboard

**Use Cases for MemeNano:**
- Generate witty meme captions based on templates
- Suggest multiple caption variations
- Adapt humor style based on meme context
- Create trending meme text

**Implementation Example:**

```typescript
// lib/api/gemini-text.ts
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateMemeCaption(
  prompt: string,
  context?: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const fullPrompt = `You are a creative meme caption writer.
Generate a witty, relatable meme caption for the following context:

Template: ${context || 'General meme'}
User idea: ${prompt}

Requirements:
- Keep it concise (under 100 characters)
- Make it funny and relatable
- Use internet culture references when appropriate
- Format for top/bottom text if specified

Return only the caption text, nothing else.`

  try {
    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    return response.text().trim()
  } catch (error) {
    console.error('Gemini text generation error:', error)
    throw new Error('Failed to generate caption')
  }
}
```

#### 2. Gemini 2.5 Flash Image (Image Editing)

**Model ID:** `gemini-2.5-flash-image-preview` (aka "nano-banana")

**Release:** August 26, 2025

**Key Features:**
- State-of-the-art image generation and editing
- Targeted transformations with natural language prompts
- Multi-image fusion capabilities
- Character consistency across scenes
- SynthID watermarking for AI-generated content

**Capabilities:**
- Blur backgrounds
- Remove objects/people
- Alter poses and positions
- Colorize black and white images
- Blend multiple images
- Style transfer

**Pricing:**
- $30.00 per 1 million output tokens
- 1 image = 1,290 output tokens
- Cost per image: ~$0.039

**Use Cases for MemeNano:**
- Customize meme templates with user-provided elements
- Blend user faces into meme templates
- Remove watermarks (if legally permissible)
- Add custom objects to meme scenes
- Style transfer for unique meme aesthetics

**Implementation Example:**

```typescript
// lib/api/gemini-image.ts
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

interface ImageEditParams {
  inputImage: string // Base64 or URL
  prompt: string
  negativePrompt?: string
  styleStrength?: number
}

export async function editMemeImage({
  inputImage,
  prompt,
  negativePrompt,
  styleStrength = 0.7,
}: ImageEditParams) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-image-preview'
  })

  try {
    const result = await model.generateContent([
      {
        inlineData: {
          data: inputImage,
          mimeType: 'image/jpeg',
        },
      },
      { text: prompt },
    ])

    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini image editing error:', error)
    throw new Error('Failed to edit image')
  }
}
```

### Authentication & Setup

#### Getting Your API Key

1. Navigate to https://aistudio.google.com
2. Sign in with your Google account
3. Click "Get API key" in the left sidebar
4. Select "Create API Key"
5. Choose to create in a new or existing Google Cloud project
6. Copy your API key

#### Secure API Key Storage

**Environment Variables:**

```env
# .env.local
GEMINI_API_KEY=your_api_key_here
```

**Next.js API Route Pattern:**

```typescript
// app/api/gemini/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { generateMemeCaption } from '@/lib/api/gemini-text'

export async function POST(request: NextRequest) {
  try {
    const { prompt, context } = await request.json()

    // Validate input
    if (!prompt || prompt.length < 3) {
      return NextResponse.json(
        { error: 'Prompt must be at least 3 characters' },
        { status: 400 }
      )
    }

    // Server-side API call with protected key
    const caption = await generateMemeCaption(prompt, context)

    return NextResponse.json({ caption })
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate caption' },
      { status: 500 }
    )
  }
}
```

### Rate Limits & Quotas

#### Free Tier (2025)

**Limits:**
- **RPM (Requests Per Minute):** 5
- **TPM (Tokens Per Minute):** Varies by model
- **RPD (Requests Per Day):** 25
- **IPM (Images Per Minute):** Varies

**Reset Timing:**
- RPD quotas reset at midnight Pacific time

**Commercial Usage:**
- ✅ Explicitly permitted on free tier
- No restrictions for production applications

#### Paid Tiers

**Tier 1:**
- Significantly increased limits
- Automatic upgrade option as usage grows

**Tier 2:**
- Requires $250 spending + 30 days
- Enterprise-level quotas

#### Rate Limit Handling

```typescript
// lib/api/gemini-with-retry.ts
async function callGeminiWithRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall()
    } catch (error: any) {
      lastError = error

      // Handle 429 (rate limit)
      if (error.status === 429) {
        const waitTime = Math.pow(2, i) * 1000 // Exponential backoff
        console.log(`Rate limited, waiting ${waitTime}ms...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        continue
      }

      // Handle other errors
      throw error
    }
  }

  throw lastError!
}
```

### Prompt Engineering Best Practices

#### PTCF Framework

Google recommends the **Persona · Task · Context · Format** framework:

```typescript
function buildMemePrompt(userIdea: string, memeName: string): string {
  return `
[Persona]
You are a creative meme caption writer who understands internet culture and viral humor.

[Task]
Generate a funny, relatable caption for a "${memeName}" meme template.

[Context]
User's idea: ${userIdea}
Meme style: Image macro with top/bottom text
Target audience: General internet users (ages 18-35)

[Format]
Return two variations:
1. Top text: [text]
   Bottom text: [text]
2. Top text: [text]
   Bottom text: [text]

Keep each text under 50 characters.
  `.trim()
}
```

#### Best Practices

1. **Be Specific**
   ```typescript
   // ❌ Vague
   "Make it funny"

   // ✅ Specific
   "Create a relatable work-from-home meme caption that references video call mishaps, aimed at remote workers"
   ```

2. **Use Examples (Few-Shot Learning)**
   ```typescript
   const prompt = `
Generate a meme caption in this style:

Example 1:
Top: "BOSS: WHY ARE YOU LATE"
Bottom: "ME: MY ALARM DIDN'T GO OFF"

Example 2:
Top: "WHEN YOU FINISH THE PROJECT"
Bottom: "BUT REALIZE YOU USED THE WRONG FILE"

Now create a caption about: ${userIdea}
   `
   ```

3. **Set Constraints**
   ```typescript
   const constraints = `
Requirements:
- Maximum 50 characters per line
- No profanity or offensive content
- Use ALL CAPS for impact
- Avoid outdated slang
- Must be family-friendly
   `
   ```

4. **Iterate and Refine**
   - Start with basic prompts
   - Test with various inputs
   - Refine based on output quality
   - A/B test different prompt structures

### Safety & Content Filtering

**Built-in Safety Features:**
- Prompt Shield evaluates and blocks high-risk instructions
- Content filtering for harmful outputs
- Automatic watermarking (SynthID) for generated images

**Implementation:**

```typescript
// lib/api/content-filter.ts
export function filterMemeText(text: string): boolean {
  const prohibitedPatterns = [
    /\b(profanity|hate speech|explicit)\b/i,
    // Add more patterns
  ]

  return !prohibitedPatterns.some(pattern => pattern.test(text))
}

// Usage in API route
const caption = await generateMemeCaption(prompt, context)

if (!filterMemeText(caption)) {
  return NextResponse.json(
    { error: 'Generated content violates guidelines' },
    { status: 400 }
  )
}
```

### Common Pitfalls

1. **Rate Limit Exhaustion** - Implement caching and rate limiting on your end
2. **Insufficient Error Handling** - Always catch and handle API errors gracefully
3. **Prompt Injection** - Sanitize user inputs before including in prompts
4. **Cost Overruns** - Monitor usage and implement usage caps
5. **Lack of Fallbacks** - Have backup options when API is unavailable

---

## shadcn/ui

### Technology Overview

shadcn/ui is a collection of beautifully designed, accessible UI components built with Radix UI and Tailwind CSS. Unlike traditional component libraries, shadcn/ui provides components as copyable code that you can customize and own, making it perfect for Next.js 15 applications.

**Key Philosophy:**
- Not an npm package - components are copied into your project
- Full customization control
- Built on Radix UI for accessibility
- Styled with Tailwind CSS
- TypeScript-first approach

### Installation & Setup

#### Step 1: Create Next.js 15 Project

```bash
npx create-next-app@latest meme-nano-web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

**Flags Explained:**
- `--typescript` - Enable TypeScript
- `--tailwind` - Auto-configure Tailwind CSS
- `--eslint` - Set up ESLint
- `--app` - Use App Router
- `--src-dir` - Use `src/` directory
- `--import-alias "@/*"` - Set up path aliases

#### Step 2: Initialize shadcn/ui

```bash
cd meme-nano-web
npx shadcn@latest init
```

**Configuration Prompts:**
- Style: Default
- Base color: Slate (or your preference)
- CSS variables: Yes
- Tailwind config: Yes
- Components location: `@/components`
- Utils location: `@/lib/utils`
- React Server Components: Yes
- Write path aliases: Yes

**Note for npm users:** If you encounter peer dependency issues with React 19, use:
```bash
npm install --legacy-peer-deps
# or
npm install --force
```

#### Step 3: Install Additional Dependencies

```bash
npm install next-themes @radix-ui/react-icons
```

**next-themes:** Recommended way to manage light/dark themes in Next.js applications.

### Required Components for MemeNano

#### 1. Button Component

```bash
npx shadcn@latest add button
```

**Usage:**

```typescript
// components/generate-button.tsx
import { Button } from '@/components/ui/button'

export function GenerateButton() {
  return (
    <Button variant="default" size="lg">
      Generate Meme
    </Button>
  )
}
```

**Available Variants:**
- `default` - Primary button style
- `secondary` - Secondary button style
- `destructive` - For dangerous actions
- `outline` - Outlined button
- `ghost` - Minimal button
- `link` - Link-styled button

**Available Sizes:**
- `default` - Standard size
- `sm` - Small
- `lg` - Large
- `icon` - Icon-only button

#### 2. Input Component

```bash
npx shadcn@latest add input
```

**Usage:**

```typescript
// components/caption-input.tsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function CaptionInput() {
  return (
    <div className="space-y-2">
      <Label htmlFor="caption">Meme Caption</Label>
      <Input
        id="caption"
        type="text"
        placeholder="Enter your meme idea..."
        maxLength={100}
      />
    </div>
  )
}
```

#### 3. Card Component

```bash
npx shadcn@latest add card
```

**Usage:**

```typescript
// components/meme-card.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface MemeCardProps {
  title: string
  imageUrl: string
  boxCount: number
}

export function MemeCard({ title, imageUrl, boxCount }: MemeCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{boxCount} text boxes</CardDescription>
      </CardHeader>
      <CardContent>
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-auto rounded-md"
        />
      </CardContent>
      <CardFooter>
        <Button className="w-full">Use Template</Button>
      </CardFooter>
    </Card>
  )
}
```

#### 4. Dialog Component

```bash
npx shadcn@latest add dialog
```

**Usage:**

```typescript
// components/meme-preview-dialog.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function MemePreviewDialog({ children, memeUrl }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Your Meme</DialogTitle>
          <DialogDescription>
            Share your creation with the world!
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <img
            src={memeUrl}
            alt="Generated meme"
            className="w-full h-auto rounded-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### Additional Useful Components

```bash
# Form components
npx shadcn@latest add form
npx shadcn@latest add textarea
npx shadcn@latest add select

# Feedback components
npx shadcn@latest add toast
npx shadcn@latest add alert

# Layout components
npx shadcn@latest add separator
npx shadcn@latest add skeleton

# Navigation
npx shadcn@latest add tabs
```

### Theme Configuration

#### Set Up Dark Mode

```typescript
// providers/theme-provider.tsx
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// app/layout.tsx
import { ThemeProvider } from '@/providers/theme-provider'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

#### Theme Toggle Component

```typescript
// components/theme-toggle.tsx
'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

### Tailwind CSS Configuration

**Default Configuration** (generated by shadcn init):

```javascript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ... more color definitions
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

### Best Practices

1. **Customize Components**
   - shadcn/ui components are meant to be customized
   - Edit components directly in your codebase
   - Add project-specific variants and styles

2. **Use Composition**
   ```typescript
   // Compose multiple components
   export function MemeTemplateCard({ template }) {
     return (
       <Card>
         <CardHeader>
           <div className="flex items-center justify-between">
             <CardTitle>{template.name}</CardTitle>
             <Badge variant="secondary">{template.box_count} texts</Badge>
           </div>
         </CardHeader>
         <CardContent>
           <AspectRatio ratio={1}>
             <Image src={template.url} alt={template.name} fill />
           </AspectRatio>
         </CardContent>
       </Card>
     )
   }
   ```

3. **Maintain Accessibility**
   - All shadcn/ui components are built on Radix UI (accessible by default)
   - Always include proper labels
   - Use semantic HTML
   - Test with keyboard navigation

4. **Theme Consistency**
   - Use CSS variables for colors
   - Maintain consistent spacing
   - Follow design tokens

### Common Pitfalls

1. **Don't reinstall components** - They'll be overwritten. Instead, create variants.
2. **Don't skip theme provider** - Required for dark mode support
3. **Don't forget to install peer dependencies** - Check component documentation
4. **Don't ignore TypeScript types** - Components are fully typed

---

## Zustand State Management

### Technology Overview

Zustand is a small, fast, and scalable state management solution for React applications. It offers a simple API based on hooks without boilerplate or opinions, making it perfect for Next.js 15 App Router applications.

**Key Features:**
- Minimal boilerplate
- No Context Provider required
- TypeScript-first
- Middleware support (persist, devtools)
- Excellent performance (no unnecessary re-renders)
- Works seamlessly with Server Components

### Installation

```bash
npm install zustand
```

### Setup for Next.js App Router

#### Pattern: Store Factory (Recommended)

This pattern creates a new store instance per request, preventing state leakage between requests and supporting proper SSR.

**Step 1: Define Store Factory**

```typescript
// lib/stores/meme-store.ts
import { createStore } from 'zustand/vanilla'

export interface MemeTemplate {
  id: string
  name: string
  url: string
  box_count: number
}

export interface MemeState {
  selectedTemplate: MemeTemplate | null
  templates: MemeTemplate[]
  isGenerating: boolean
  generatedMeme: string | null
}

export interface MemeActions {
  setSelectedTemplate: (template: MemeTemplate | null) => void
  setTemplates: (templates: MemeTemplate[]) => void
  setIsGenerating: (isGenerating: boolean) => void
  setGeneratedMeme: (url: string | null) => void
  resetMeme: () => void
}

export type MemeStore = MemeState & MemeActions

export const defaultInitState: MemeState = {
  selectedTemplate: null,
  templates: [],
  isGenerating: false,
  generatedMeme: null,
}

export const createMemeStore = (
  initState: MemeState = defaultInitState
) => {
  return createStore<MemeStore>()((set) => ({
    ...initState,
    setSelectedTemplate: (template) =>
      set({ selectedTemplate: template }),
    setTemplates: (templates) =>
      set({ templates }),
    setIsGenerating: (isGenerating) =>
      set({ isGenerating }),
    setGeneratedMeme: (url) =>
      set({ generatedMeme: url }),
    resetMeme: () =>
      set({
        selectedTemplate: null,
        generatedMeme: null,
        isGenerating: false,
      }),
  }))
}
```

**Step 2: Create Store Provider**

```typescript
// providers/meme-store-provider.tsx
'use client'

import { createContext, useContext, useRef, type ReactNode } from 'react'
import { useStore } from 'zustand'
import {
  createMemeStore,
  type MemeStore,
  type MemeState,
} from '@/lib/stores/meme-store'

export type MemeStoreApi = ReturnType<typeof createMemeStore>

const MemeStoreContext = createContext<MemeStoreApi | undefined>(undefined)

export interface MemeStoreProviderProps {
  children: ReactNode
  initialState?: Partial<MemeState>
}

export function MemeStoreProvider({
  children,
  initialState,
}: MemeStoreProviderProps) {
  const storeRef = useRef<MemeStoreApi>()

  if (!storeRef.current) {
    storeRef.current = createMemeStore(initialState as MemeState)
  }

  return (
    <MemeStoreContext.Provider value={storeRef.current}>
      {children}
    </MemeStoreContext.Provider>
  )
}

export function useMemeStore<T>(
  selector: (store: MemeStore) => T
): T {
  const memeStoreContext = useContext(MemeStoreContext)

  if (!memeStoreContext) {
    throw new Error('useMemeStore must be used within MemeStoreProvider')
  }

  return useStore(memeStoreContext, selector)
}
```

**Step 3: Integrate Provider in Layout**

```typescript
// app/layout.tsx
import { MemeStoreProvider } from '@/providers/meme-store-provider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <MemeStoreProvider>
          {children}
        </MemeStoreProvider>
      </body>
    </html>
  )
}
```

**Step 4: Use Store in Client Components**

```typescript
// components/meme-generator.tsx
'use client'

import { useMemeStore } from '@/providers/meme-store-provider'
import { Button } from '@/components/ui/button'

export function MemeGenerator() {
  // Select only needed state (prevents unnecessary re-renders)
  const selectedTemplate = useMemeStore((state) => state.selectedTemplate)
  const isGenerating = useMemeStore((state) => state.isGenerating)
  const setIsGenerating = useMemeStore((state) => state.setIsGenerating)
  const setGeneratedMeme = useMemeStore((state) => state.setGeneratedMeme)

  const handleGenerate = async () => {
    if (!selectedTemplate) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/memes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: selectedTemplate.id }),
      })
      const data = await response.json()
      setGeneratedMeme(data.url)
    } catch (error) {
      console.error('Failed to generate meme:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div>
      {selectedTemplate && (
        <div>
          <img src={selectedTemplate.url} alt={selectedTemplate.name} />
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Meme'}
          </Button>
        </div>
      )}
    </div>
  )
}
```

### Advanced Patterns

#### 1. Slices Pattern (Modularity)

For larger applications, split store into smaller slices:

```typescript
// lib/stores/slices/template-slice.ts
import { StateCreator } from 'zustand'

export interface TemplateSlice {
  selectedTemplate: MemeTemplate | null
  templates: MemeTemplate[]
  setSelectedTemplate: (template: MemeTemplate | null) => void
  setTemplates: (templates: MemeTemplate[]) => void
}

export const createTemplateSlice: StateCreator<TemplateSlice> = (set) => ({
  selectedTemplate: null,
  templates: [],
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
  setTemplates: (templates) => set({ templates }),
})

// lib/stores/slices/generation-slice.ts
export interface GenerationSlice {
  isGenerating: boolean
  generatedMeme: string | null
  setIsGenerating: (isGenerating: boolean) => void
  setGeneratedMeme: (url: string | null) => void
}

export const createGenerationSlice: StateCreator<GenerationSlice> = (set) => ({
  isGenerating: false,
  generatedMeme: null,
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setGeneratedMeme: (url) => set({ generatedMeme: url }),
})

// lib/stores/meme-store.ts (combined)
import { create } from 'zustand'
import { createTemplateSlice, TemplateSlice } from './slices/template-slice'
import { createGenerationSlice, GenerationSlice } from './slices/generation-slice'

type MemeStore = TemplateSlice & GenerationSlice

export const useMemeStore = create<MemeStore>()((...a) => ({
  ...createTemplateSlice(...a),
  ...createGenerationSlice(...a),
}))
```

#### 2. Persist Middleware

Save state to localStorage:

```typescript
// lib/stores/persisted-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserPreferences {
  theme: 'light' | 'dark'
  favoriteTemplates: string[]
  addFavorite: (templateId: string) => void
  removeFavorite: (templateId: string) => void
}

export const usePreferencesStore = create<UserPreferences>()(
  persist(
    (set) => ({
      theme: 'light',
      favoriteTemplates: [],
      addFavorite: (templateId) =>
        set((state) => ({
          favoriteTemplates: [...state.favoriteTemplates, templateId],
        })),
      removeFavorite: (templateId) =>
        set((state) => ({
          favoriteTemplates: state.favoriteTemplates.filter(
            (id) => id !== templateId
          ),
        })),
    }),
    {
      name: 'meme-preferences',
    }
  )
)
```

#### 3. Devtools Middleware

Enable Redux DevTools support:

```typescript
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export const useMemeStore = create<MemeStore>()(
  devtools(
    (set) => ({
      // ... store implementation
    }),
    {
      name: 'MemeStore',
    }
  )
)
```

### TypeScript Best Practices

#### 1. Strict Typing

```typescript
// Use curried create for proper TypeScript inference
import { create } from 'zustand'

interface BearStore {
  bears: number
  increase: (by: number) => void
}

// ✅ Correct: Curried syntax
const useBearStore = create<BearStore>()((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
}))

// ❌ Incorrect: Non-curried (loses type inference in middleware)
const useBearStore = create<BearStore>((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
}))
```

#### 2. Selector Typing

```typescript
// Automatic type inference from selector
const bears = useMemeStore((state) => state.bears) // number
const increase = useMemeStore((state) => state.increase) // (by: number) => void

// Manual typing (rarely needed)
const selectedTemplate = useMemeStore<MemeTemplate | null>(
  (state) => state.selectedTemplate
)
```

### Performance Optimization

#### 1. Selective Subscriptions

```typescript
// ❌ Bad: Re-renders on any state change
function Component() {
  const store = useMemeStore()
  return <div>{store.selectedTemplate?.name}</div>
}

// ✅ Good: Only re-renders when selectedTemplate changes
function Component() {
  const selectedTemplate = useMemeStore((state) => state.selectedTemplate)
  return <div>{selectedTemplate?.name}</div>
}
```

#### 2. Shallow Equality

```typescript
import { shallow } from 'zustand/shallow'

// Multiple selectors with shallow comparison
const { isGenerating, selectedTemplate } = useMemeStore(
  (state) => ({
    isGenerating: state.isGenerating,
    selectedTemplate: state.selectedTemplate,
  }),
  shallow
)
```

### Common Pitfalls

1. **Don't create store globally in App Router** - Use the provider pattern
2. **Don't overuse global state** - Keep state local when possible
3. **Don't forget to use selectors** - Prevents unnecessary re-renders
4. **Don't mutate state directly** - Always use set() function
5. **Don't use store in Server Components** - Only Client Components can use hooks

---

## Web Share API

### Technology Overview

The Web Share API provides a native way for users to share content through their device's built-in share sheet. This is particularly valuable for mobile users, as it integrates seamlessly with installed apps and system-level sharing.

### Browser Compatibility (2025)

**Compatibility Score:** 67/100 (Moderate support)

#### Desktop Support

| Browser | Support | Versions |
|---------|---------|----------|
| Chrome | ✅ Full | 132-136, Partial 89-131 |
| Edge | ✅ Full | 104-133, Partial 81-103 |
| Safari | ✅ Full | 12.1-18.4 |
| Firefox | ❌ None | Not supported |
| Opera | ✅ Full | 114+ |
| IE | ❌ None | Not supported |

#### Mobile Support

| Browser | Support | Versions |
|---------|---------|----------|
| Chrome Android | ✅ Full | All versions |
| Firefox Android | ✅ Full | All versions |
| Safari iOS | ✅ Full | 12.2-18.4 |
| Samsung Internet | ✅ Full | 8.2-27 |

### Key Requirements

1. **HTTPS Only** - API only works in secure contexts
2. **User Gesture Required** - Must be triggered by user interaction (click, tap)
3. **Transient Activation** - Must be called in response to a UI event

### Implementation

#### Basic Implementation

```typescript
// lib/utils/share.ts
export interface ShareData {
  title?: string
  text?: string
  url?: string
  files?: File[]
}

export async function shareContent(data: ShareData): Promise<boolean> {
  // Check if Web Share API is supported
  if (!navigator.share) {
    return false
  }

  try {
    await navigator.share({
      title: data.title,
      text: data.text,
      url: data.url,
    })
    return true
  } catch (error) {
    // User cancelled or error occurred
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Share cancelled by user')
    } else {
      console.error('Share failed:', error)
    }
    return false
  }
}
```

#### React Component with Web Share

```typescript
// components/share-meme-button.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Copy, Twitter } from 'lucide-react'
import { shareContent } from '@/lib/utils/share'

interface ShareMemeButtonProps {
  memeUrl: string
  title?: string
}

export function ShareMemeButton({ memeUrl, title = 'Check out my meme!' }: ShareMemeButtonProps) {
  const [isSupported] = useState(() =>
    typeof navigator !== 'undefined' && !!navigator.share
  )

  const handleShare = async () => {
    const shared = await shareContent({
      title: 'MemeNano',
      text: title,
      url: memeUrl,
    })

    if (!shared) {
      // Fallback: Open Twitter share
      handleTwitterShare()
    }
  }

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(memeUrl)}`
    window.open(twitterUrl, '_blank', 'width=550,height=420')
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(memeUrl)
      // Show toast notification
      console.log('Link copied!')
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <div className="flex gap-2">
      {isSupported ? (
        <Button onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      ) : (
        <>
          <Button onClick={handleTwitterShare} variant="outline">
            <Twitter className="mr-2 h-4 w-4" />
            Tweet
          </Button>
          <Button onClick={handleCopyLink} variant="outline">
            <Copy className="mr-2 h-4 w-4" />
            Copy Link
          </Button>
        </>
      )}
    </div>
  )
}
```

### Fallback Strategies

#### 1. Social Media Sharing Links

```typescript
// lib/utils/social-share.ts
export interface SocialShareOptions {
  url: string
  title: string
  hashtags?: string[]
}

export const socialShareLinks = {
  twitter: ({ url, title, hashtags = [] }: SocialShareOptions) => {
    const hashtagStr = hashtags.length > 0 ? `&hashtags=${hashtags.join(',')}` : ''
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}${hashtagStr}`
  },

  facebook: ({ url }: SocialShareOptions) => {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  },

  reddit: ({ url, title }: SocialShareOptions) => {
    return `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
  },

  whatsapp: ({ url, title }: SocialShareOptions) => {
    return `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`
  },

  telegram: ({ url, title }: SocialShareOptions) => {
    return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  },
}

export function openShareWindow(url: string) {
  window.open(url, '_blank', 'width=550,height=420,menubar=no,toolbar=no')
}
```

#### 2. Comprehensive Share Dialog

```typescript
// components/share-dialog.tsx
'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { socialShareLinks, openShareWindow } from '@/lib/utils/social-share'
import { Twitter, Facebook, Send, MessageCircle, Link as LinkIcon } from 'lucide-react'

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  memeUrl: string
  title: string
}

export function ShareDialog({ open, onOpenChange, memeUrl, title }: ShareDialogProps) {
  const shareOptions = [
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'text-blue-400',
      onClick: () => openShareWindow(socialShareLinks.twitter({ url: memeUrl, title, hashtags: ['meme', 'MemeNano'] })),
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600',
      onClick: () => openShareWindow(socialShareLinks.facebook({ url: memeUrl, title })),
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'text-green-500',
      onClick: () => openShareWindow(socialShareLinks.whatsapp({ url: memeUrl, title })),
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'text-blue-500',
      onClick: () => openShareWindow(socialShareLinks.telegram({ url: memeUrl, title })),
    },
  ]

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(memeUrl)
    // Show success toast
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Meme</DialogTitle>
          <DialogDescription>
            Choose a platform to share your creation
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {shareOptions.map((option) => (
            <Button
              key={option.name}
              variant="outline"
              onClick={option.onClick}
              className="h-20 flex-col gap-2"
            >
              <option.icon className={`h-6 w-6 ${option.color}`} />
              <span>{option.name}</span>
            </Button>
          ))}
        </div>
        <div className="mt-4">
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleCopyLink}
          >
            <LinkIcon className="mr-2 h-4 w-4" />
            Copy Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### Best Practices

1. **Feature Detection**
   ```typescript
   const canShare = () => {
     return typeof navigator !== 'undefined' &&
            navigator.share !== undefined
   }
   ```

2. **Handle Cancellation Gracefully**
   ```typescript
   try {
     await navigator.share(data)
   } catch (error) {
     if (error.name === 'AbortError') {
       // User cancelled - this is normal, don't show error
       return
     }
     // Actual error - handle appropriately
     console.error(error)
   }
   ```

3. **Provide Visual Feedback**
   ```typescript
   const [isSharing, setIsSharing] = useState(false)

   const handleShare = async () => {
     setIsSharing(true)
     try {
       await navigator.share(data)
     } finally {
       setIsSharing(false)
     }
   }
   ```

4. **Use Platform-Appropriate Icons**
   - iOS: Use SF Symbols style (square with arrow up)
   - Android: Use Material Design (share icon)
   - Web: Use generic share icon

### Sharing Files (Images)

```typescript
// lib/utils/share-image.ts
export async function shareImage(
  imageUrl: string,
  title: string
): Promise<boolean> {
  // Check if file sharing is supported
  if (!navigator.canShare) {
    return false
  }

  try {
    // Fetch the image
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const file = new File([blob], 'meme.jpg', { type: 'image/jpeg' })

    // Check if we can share this file
    if (!navigator.canShare({ files: [file] })) {
      return false
    }

    await navigator.share({
      files: [file],
      title,
      text: 'Check out my meme!',
    })

    return true
  } catch (error) {
    console.error('Failed to share image:', error)
    return false
  }
}
```

### Testing

```typescript
// Test in browser console
if (navigator.share) {
  navigator.share({
    title: 'Test Share',
    text: 'Testing Web Share API',
    url: window.location.href,
  })
}
```

---

## Security Best Practices

### Overview

Security is paramount when building web applications that handle user data, API keys, and third-party integrations. This section covers essential security practices for the MemeNano project.

### 1. API Key Management

#### Environment Variables

**Setup:**

```env
# .env.local (NEVER commit this file)
GEMINI_API_KEY=your_gemini_api_key_here
IMGFLIP_USERNAME=your_imgflip_username
IMGFLIP_PASSWORD=your_imgflip_password

# .env.example (commit this as a template)
GEMINI_API_KEY=your_key_here
IMGFLIP_USERNAME=your_username
IMGFLIP_PASSWORD=your_password
```

**`.gitignore` Configuration:**

```gitignore
# Environment variables
.env
.env.local
.env.*.local
.env.development.local
.env.test.local
.env.production.local
```

#### Server-Side Only Access

**✅ Correct: API Route**

```typescript
// app/api/gemini/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // API key accessed only on server
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    )
  }

  // Use apiKey for API call...
}
```

**❌ Incorrect: Client Component**

```typescript
// This exposes your API key!
'use client'

export function BadComponent() {
  const apiKey = process.env.GEMINI_API_KEY // ❌ NEVER DO THIS
  // Even if you don't log it, it's in the bundle!
}
```

#### Client-Safe Variables

Only use `NEXT_PUBLIC_` prefix for non-sensitive data:

```env
NEXT_PUBLIC_APP_NAME=MemeNano
NEXT_PUBLIC_APP_URL=https://memenano.com
```

### 2. Rate Limiting

#### Implementation with Upstash Redis

**Install Dependencies:**

```bash
npm install @upstash/ratelimit @upstash/redis
```

**Setup:**

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Create a new ratelimiter that allows 10 requests per 10 seconds
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: '@upstash/ratelimit',
})

// Helper function to check rate limit
export async function checkRateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier)

  return {
    success,
    limit,
    reset,
    remaining,
  }
}
```

**Usage in API Route:**

```typescript
// app/api/memes/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Get user identifier (IP address or user ID)
  const ip = request.ip ?? '127.0.0.1'

  // Check rate limit
  const { success, limit, reset, remaining } = await checkRateLimit(ip)

  if (!success) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        limit,
        remaining,
        reset,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    )
  }

  // Process request...
}
```

#### Memory-Based Rate Limiting (Development)

```typescript
// lib/rate-limit-memory.ts
interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

export function checkRateLimitMemory(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000 // 1 minute
) {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  // Clean up expired entries
  if (entry && now > entry.resetTime) {
    rateLimitMap.delete(identifier)
  }

  const current = rateLimitMap.get(identifier)

  if (!current) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    })
    return { success: true, remaining: limit - 1 }
  }

  if (current.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: current.resetTime,
    }
  }

  current.count++
  return { success: true, remaining: limit - current.count }
}
```

### 3. Input Sanitization & Validation

#### Zod Schema Validation

**Install:**

```bash
npm install zod
```

**Implementation:**

```typescript
// lib/validation/meme-schema.ts
import { z } from 'zod'

export const generateMemeSchema = z.object({
  templateId: z.string().min(1, 'Template ID is required'),
  topText: z
    .string()
    .max(100, 'Top text must be under 100 characters')
    .optional(),
  bottomText: z
    .string()
    .max(100, 'Bottom text must be under 100 characters')
    .optional(),
  prompt: z
    .string()
    .min(3, 'Prompt must be at least 3 characters')
    .max(500, 'Prompt must be under 500 characters'),
})

export type GenerateMemeInput = z.infer<typeof generateMemeSchema>
```

**Usage:**

```typescript
// app/api/memes/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { generateMemeSchema } from '@/lib/validation/meme-schema'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = generateMemeSchema.parse(body)

    // Use validatedData (type-safe and validated)
    // ...
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
```

#### XSS Prevention

**DOMPurify for HTML Sanitization:**

```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

```typescript
// lib/utils/sanitize.ts
import DOMPurify from 'dompurify'

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href'],
  })
}

export function sanitizeText(text: string): string {
  // Remove potentially dangerous characters
  return text
    .replace(/[<>]/g, '') // Remove < and >
    .trim()
}
```

**React Best Practices:**

```typescript
// ❌ Dangerous
function Component({ userContent }) {
  return <div dangerouslySetInnerHTML={{ __html: userContent }} />
}

// ✅ Safe
function Component({ userContent }) {
  return <div>{userContent}</div> // React escapes by default
}

// ✅ Safe with sanitization
function Component({ userContent }) {
  const clean = sanitizeHTML(userContent)
  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
```

### 4. Security Headers

#### Middleware Implementation

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://api.imgflip.com https://api.gemini.com",
      "frame-ancestors 'none'",
    ].join('; ')
  )

  // X-Frame-Options (prevent clickjacking)
  response.headers.set('X-Frame-Options', 'DENY')

  // X-Content-Type-Options (prevent MIME sniffing)
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Referrer-Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions-Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
```

#### CSP with Nonces (Advanced)

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import crypto from 'crypto'

export function middleware(request: NextRequest) {
  const nonce = crypto.randomBytes(16).toString('base64')

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'nonce-${nonce}';
    img-src 'self' data: https:;
    font-src 'self';
    connect-src 'self' https://api.imgflip.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s{2,}/g, ' ').trim()

  const response = NextResponse.next()
  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('x-nonce', nonce)

  return response
}
```

### 5. CORS Configuration

```typescript
// app/api/memes/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const response = NextResponse.json({ memes: [] })

  // CORS headers
  response.headers.set('Access-Control-Allow-Origin', 'https://yourdomain.com')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  return response
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://yourdomain.com',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
```

### 6. Error Handling

**Don't expose sensitive information:**

```typescript
// ❌ Bad - Exposes internals
try {
  await riskyOperation()
} catch (error) {
  return NextResponse.json({ error: error.message }, { status: 500 })
}

// ✅ Good - Generic message
try {
  await riskyOperation()
} catch (error) {
  console.error('Operation failed:', error) // Log for debugging
  return NextResponse.json(
    { error: 'An error occurred. Please try again.' },
    { status: 500 }
  )
}
```

### Security Checklist

- [ ] Environment variables stored in `.env.local`
- [ ] `.env.local` added to `.gitignore`
- [ ] API keys accessed only in server-side code
- [ ] Rate limiting implemented
- [ ] Input validation with Zod
- [ ] XSS prevention (sanitize user inputs)
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Error messages don't expose sensitive data
- [ ] HTTPS enforced in production
- [ ] Dependencies regularly updated
- [ ] Security audit performed

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)

**Goals:** Set up project infrastructure and core dependencies

1. **Project Setup**
   - ✅ Initialize Next.js 15 with TypeScript
   - ✅ Configure Tailwind CSS
   - ✅ Set up path aliases
   - ✅ Initialize Git repository

2. **Install Core Dependencies**
   ```bash
   npm install zustand
   npm install @google/generative-ai
   npx shadcn@latest init
   npx shadcn@latest add button input card dialog
   ```

3. **Environment Configuration**
   - Create `.env.local` and `.env.example`
   - Add to `.gitignore`
   - Set up API keys (Gemini, Imgflip)

4. **Project Structure**
   ```
   src/
   ├── app/
   ├── components/
   │   ├── ui/
   │   ├── features/
   │   └── layout/
   ├── lib/
   │   ├── api/
   │   ├── stores/
   │   └── utils/
   └── types/
   ```

### Phase 2: API Integration (Week 2)

**Goals:** Integrate Imgflip and Gemini APIs

1. **Imgflip Integration**
   - Implement `getPopularMemes()` function
   - Create type definitions
   - Add caching strategy
   - Build API route for meme captioning

2. **Gemini Integration**
   - Set up Gemini client
   - Implement text generation for captions
   - Add error handling and retries
   - Create API routes

3. **Testing**
   - Test API endpoints
   - Verify rate limiting
   - Check error scenarios

### Phase 3: Core Features (Week 3)

**Goals:** Build main meme generation functionality

1. **Template Selection**
   - Display popular meme templates
   - Implement template search/filter
   - Create template card components
   - Add selection state management

2. **Caption Generation**
   - Build caption input form
   - Integrate Gemini for AI suggestions
   - Implement manual caption entry
   - Add character count and validation

3. **Meme Generation**
   - Create meme preview component
   - Implement generate functionality
   - Add loading states
   - Handle errors gracefully

### Phase 4: UI/UX Polish (Week 4)

**Goals:** Enhance user interface and experience

1. **UI Components**
   - Implement responsive design
   - Add dark mode support
   - Create loading skeletons
   - Build error states

2. **User Flow**
   - Optimize template browsing
   - Improve caption input UX
   - Add success feedback
   - Implement undo/redo

3. **Accessibility**
   - Add ARIA labels
   - Test keyboard navigation
   - Verify screen reader support
   - Check color contrast

### Phase 5: Advanced Features (Week 5)

**Goals:** Add sharing and customization

1. **Web Share Integration**
   - Implement Web Share API
   - Add fallback share options
   - Create social media links
   - Test across devices

2. **Image Editing (Optional)**
   - Integrate Gemini Image API
   - Add custom filters
   - Implement crop/resize
   - Build editing UI

3. **Favorites System**
   - Add favorite templates
   - Implement localStorage persistence
   - Create favorites view
   - Add clear favorites option

### Phase 6: Security & Optimization (Week 6)

**Goals:** Harden security and optimize performance

1. **Security Implementation**
   - Set up rate limiting
   - Configure security headers
   - Implement input validation
   - Add CORS configuration

2. **Performance Optimization**
   - Implement image optimization
   - Add caching strategies
   - Optimize bundle size
   - Set up CDN

3. **Testing**
   - Write unit tests
   - Add integration tests
   - Perform security audit
   - Test on multiple devices

### Phase 7: Deployment (Week 7)

**Goals:** Deploy to production

1. **Pre-Deployment**
   - Review security checklist
   - Test all features
   - Optimize images
   - Verify environment variables

2. **Deployment**
   - Deploy to Vercel
   - Configure domain
   - Set up analytics
   - Configure error monitoring

3. **Post-Deployment**
   - Monitor performance
   - Track errors
   - Gather user feedback
   - Plan improvements

---

## Resources & References

### Official Documentation

#### Next.js & React
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [Next.js App Router Guide](https://nextjs.org/docs/app)
- [Server Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [TypeScript in Next.js](https://nextjs.org/docs/app/api-reference/config/typescript)

#### APIs
- [Imgflip API Documentation](https://imgflip.com/api)
- [Google Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- [Gemini Pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [Prompt Engineering Guide](https://ai.google.dev/gemini-api/docs/prompting-strategies)

#### UI & State Management
- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [Zustand Documentation](https://zustand.docs.pmnd.rs)
- [Zustand Next.js Guide](https://zustand.docs.pmnd.rs/guides/nextjs)
- [Tailwind CSS](https://tailwindcss.com/docs)

#### Web APIs
- [Web Share API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)
- [Can I Use - Web Share](https://caniuse.com/web-share)

### Security Resources
- [Next.js Security Guide](https://nextjs.org/docs/app/guides/data-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

### Tools & Libraries
- [Zod Validation](https://zod.dev)
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [Upstash Rate Limiting](https://upstash.com/docs/oss/sdks/ts/ratelimit/overview)
- [next-themes](https://github.com/pacocoursey/next-themes)

### Community Resources
- [Next.js Discord](https://discord.gg/nextjs)
- [Vercel Community](https://github.com/vercel/next.js/discussions)
- [shadcn/ui GitHub](https://github.com/shadcn-ui/ui)
- [Stack Overflow - Next.js](https://stackoverflow.com/questions/tagged/next.js)

### Best Practices Articles
- [Next.js 15 Best Practices 2025](https://dev.to/bajrayejoon/best-practices-for-organizing-your-nextjs-15-2025-53ji)
- [React 19 Features Guide](https://dev.to/mohitdecodes/react-19-features-you-should-know-in-2025-20pd)
- [TypeScript Best Practices 2025](https://www.bacancytechnology.com/blog/typescript-best-practices)

---

## Appendix

### A. Glossary

**App Router** - Next.js routing system using the `app` directory (vs Pages Router)

**Server Components** - React components that render on the server, don't send JavaScript to client

**Client Components** - React components marked with `'use client'`, run in the browser

**Actions** - React 19 feature for handling form submissions and data mutations

**Hydration** - Process of attaching React to server-rendered HTML

**SSR** - Server-Side Rendering, rendering pages on the server

**CSP** - Content Security Policy, HTTP header to prevent XSS attacks

**XSS** - Cross-Site Scripting, security vulnerability allowing script injection

**Rate Limiting** - Restricting number of API requests in a time window

**Middleware** - Code that runs before a request is completed

**Zod** - TypeScript-first schema validation library

**shadcn/ui** - Component collection built on Radix UI and Tailwind CSS

**Zustand** - Lightweight state management library for React

**Web Share API** - Browser API for native sharing functionality

### B. Version Compatibility Matrix

| Technology | Version | Release Date | Status |
|------------|---------|--------------|--------|
| Next.js | 15.5 | Aug 2025 | Stable |
| React | 19 | Dec 2024 | Stable |
| TypeScript | 5.x | Latest | Stable |
| Node.js | 18.18+ | - | Required |
| Tailwind CSS | 3.4+ | Latest | Stable |
| shadcn/ui | Latest | 2025 | Stable |
| Zustand | 5.x | Latest | Stable |

### C. Environment Variables Template

```env
# .env.example

# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Imgflip API
IMGFLIP_USERNAME=your_imgflip_username
IMGFLIP_PASSWORD=your_imgflip_password

# App Configuration
NEXT_PUBLIC_APP_NAME=MemeNano
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Rate Limiting (Optional - Upstash)
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

### D. Useful Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript check

# Dependencies
npm install              # Install dependencies
npm update               # Update dependencies
npm audit                # Check for vulnerabilities
npm audit fix            # Fix vulnerabilities

# shadcn/ui
npx shadcn@latest add [component]  # Add component
npx shadcn@latest init             # Initialize shadcn/ui

# Next.js
npx next typegen         # Generate TypeScript types
npx next info            # Display system information
```

---

**Research Completed:** September 30, 2025
**Document Version:** 1.0
**Total Sources Consulted:** 50+
**Last Updated:** 2025-09-30