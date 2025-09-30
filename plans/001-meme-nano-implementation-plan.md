# MemeNano Implementation Plan

**Version:** 1.0 (MVP)
**Date:** September 30, 2025
**Project:** MemeNano - AI First Meme Generator

---

## Table of Contents

1. [Overview](#overview)
2. [Project Architecture](#project-architecture)
3. [Technology Stack](#technology-stack)
4. [Folder Structure](#folder-structure)
5. [Implementation Phases](#implementation-phases)
6. [Detailed Component Specifications](#detailed-component-specifications)
7. [API Endpoints](#api-endpoints)
8. [State Management](#state-management)
9. [Security Implementation](#security-implementation)
10. [Testing Strategy](#testing-strategy)
11. [Performance Optimization](#performance-optimization)
12. [Accessibility Requirements](#accessibility-requirements)
13. [Deployment Configuration](#deployment-configuration)
14. [Files to Create/Modify](#files-to-createmodify)
15. [Implementation Checklist](#implementation-checklist)

---

## Overview

MemeNano is an AI-first web application that simplifies meme creation by automating the entire process. Users input a single text prompt describing their meme idea, and AI generates up to 4 complete memes with appropriate templates and captions.

### Key Features
- Prompt-based meme generation using AI
- Bring Your Own Key (BYOK) for sustainability
- Download and share functionality
- Mobile-first responsive design
- Minimalist, intuitive UI

### Design Principles
- **YAGNI (You Aren't Gonna Need It):** Only implement MVP features
- **KISS (Keep It Simple, Stupid):** Simple architecture and intuitive UX
- **DRY (Don't Repeat Yourself):** Reusable components and utilities

---

## Project Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Home Screen  │  │Results Screen│  │Settings Screen│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│           │                │                 │              │
│           └────────────────┴─────────────────┘              │
│                         │                                    │
│                    Zustand Store                             │
│                 (API Key, UI State)                          │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS
                          │
┌─────────────────────────▼───────────────────────────────────┐
│              Next.js API Routes (Proxy Layer)                │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ /api/analyze     │  │ /api/generate    │                │
│  │ (Gemini Flash)   │  │ (Gemini Image)   │                │
│  └──────────────────┘  └──────────────────┘                │
└──────────────┬────────────────────┬─────────────────────────┘
               │                    │
               │                    │
       ┌───────▼────────┐   ┌──────▼──────────┐
       │  Gemini API    │   │  Imgflip API    │
       │  (2.5 Flash)   │   │  (Templates)    │
       └────────────────┘   └─────────────────┘
```

### Data Flow

1. **User Input → Analysis:**
   - User enters prompt on Home Screen
   - Prompt sent to `/api/analyze` with API key
   - Gemini 2.5 Flash analyzes prompt
   - Returns search keywords and caption suggestions

2. **Template Search:**
   - Keywords used to search Imgflip API
   - Returns top matching meme templates
   - Templates filtered and ranked

3. **Meme Generation:**
   - Template + Captions sent to `/api/generate`
   - Gemini 2.5 Flash Image generates final meme
   - Process repeats for up to 4 memes
   - Generated memes returned to client

4. **Results Display:**
   - Memes displayed in grid/carousel
   - Download/Share actions available

---

## Technology Stack

### Frontend Framework
- **Next.js 15** (App Router)
- **React 19** (Client/Server Components)
- **TypeScript** (Type safety)

### Styling & UI
- **TailwindCSS** (Utility-first styling)
- **shadcn/ui** (Accessible components)
- **Radix UI** (Primitive components)

### State Management
- **Zustand** (Lightweight state)
- **Zustand Persist** (localStorage persistence)

### API & Networking
- **Native Fetch API** (HTTP requests)
- **Next.js API Routes** (Serverless functions)

### External APIs
- **Google Gemini API**
  - `gemini-2.5-flash` (Prompt analysis, caption generation)
  - `gemini-2.5-flash-image-preview` (Image generation)
- **Imgflip API** (Meme templates)

### Deployment
- **Vercel** (Full-stack deployment)
- **Vercel Edge Functions** (Low-latency API routes)

---

## Folder Structure

```
meme-nano-web/
├── app/
│   ├── layout.tsx                 # Root layout with global styles
│   ├── page.tsx                   # Home screen (/)
│   ├── results/
│   │   └── page.tsx               # Results screen (/results)
│   ├── settings/
│   │   └── page.tsx               # Settings screen (/settings)
│   ├── api/
│   │   ├── analyze/
│   │   │   └── route.ts           # Prompt analysis endpoint
│   │   ├── generate/
│   │   │   └── route.ts           # Meme generation endpoint
│   │   └── templates/
│   │       └── route.ts           # Imgflip template search endpoint
│   ├── globals.css                # Global styles & Tailwind imports
│   └── error.tsx                  # Global error boundary
│
├── components/
│   ├── ui/                        # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── card.tsx
│   │   ├── toast.tsx
│   │   └── loading-spinner.tsx
│   ├── home/
│   │   ├── PromptInput.tsx        # Main prompt input component
│   │   └── GenerateButton.tsx     # Generate CTA button
│   ├── results/
│   │   ├── MemeGrid.tsx           # Grid/Carousel of memes
│   │   ├── MemeCard.tsx           # Individual meme card
│   │   └── MemeActions.tsx        # Download/Share buttons
│   ├── settings/
│   │   ├── ApiKeyInput.tsx        # API key input form
│   │   └── ApiKeyInstructions.tsx # Help text and links
│   └── shared/
│       ├── Header.tsx             # App header with navigation
│       ├── ErrorMessage.tsx       # Error display component
│       └── LoadingState.tsx       # Loading indicators
│
├── lib/
│   ├── store/
│   │   ├── useAppStore.ts         # Zustand store definition
│   │   └── slices/
│   │       ├── apiKeySlice.ts     # API key state
│   │       ├── memeSlice.ts       # Meme generation state
│   │       └── uiSlice.ts         # UI state (loading, errors)
│   ├── services/
│   │   ├── gemini.ts              # Gemini API client
│   │   └── imgflip.ts             # Imgflip API client
│   ├── utils/
│   │   ├── validators.ts          # Input validation
│   │   ├── encryption.ts          # API key encryption (optional)
│   │   ├── download.ts            # File download utilities
│   │   └── share.ts               # Web Share API utilities
│   └── types/
│       ├── api.ts                 # API response types
│       ├── meme.ts                # Meme data types
│       └── store.ts               # Store state types
│
├── public/
│   ├── favicon.ico
│   └── og-image.png               # Open Graph image
│
├── config/
│   ├── site.ts                    # Site metadata
│   └── constants.ts               # App constants
│
├── docs/
│   ├── product-overview-pdr.md    # Existing PDR document
│   ├── screen-01.png              # Wireframe: Home
│   ├── screen-02.png              # Wireframe: Results
│   └── screen-03.png              # Wireframe: Settings
│
├── plans/
│   └── 001-meme-nano-implementation-plan.md  # This document
│
├── .env.example                   # Environment variables template
├── .env.local                     # Local environment (gitignored)
├── .gitignore
├── next.config.ts                 # Next.js configuration
├── tailwind.config.ts             # Tailwind configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json
├── components.json                # shadcn/ui configuration
└── README.md
```

---

## Implementation Phases

### Phase 1: Project Setup & Configuration (Day 1)
**Goal:** Initialize project with all necessary dependencies and configurations

**Tasks:**
1. Initialize Next.js 15 project with TypeScript
2. Configure TailwindCSS
3. Initialize shadcn/ui
4. Set up Zustand store structure
5. Configure ESLint and Prettier
6. Set up environment variables
7. Create basic folder structure

**Deliverables:**
- Running development server
- Basic project structure
- All dependencies installed

---

### Phase 2: Core UI Components (Days 2-3)
**Goal:** Build all UI components using shadcn/ui and custom components

**Tasks:**
1. Install required shadcn/ui components
2. Create layout and navigation components
3. Build Home screen components
4. Build Settings screen components
5. Build Results screen components
6. Implement responsive design
7. Add loading and error states

**Deliverables:**
- Complete UI component library
- All three screens with static content
- Responsive layouts working

---

### Phase 3: State Management (Day 3)
**Goal:** Implement Zustand store with persistence

**Tasks:**
1. Create store slices for API key, memes, and UI
2. Implement localStorage persistence
3. Add actions for state updates
4. Create custom hooks for store access
5. Implement API key validation

**Deliverables:**
- Working Zustand store
- Persistent API key storage
- State management hooks

---

### Phase 4: API Routes & Integration (Days 4-5)
**Goal:** Implement Next.js API routes and external API integrations

**Tasks:**
1. Create `/api/templates` endpoint (Imgflip search)
2. Create `/api/analyze` endpoint (Gemini prompt analysis)
3. Create `/api/generate` endpoint (Gemini image generation)
4. Implement rate limiting
5. Add request/response validation
6. Implement error handling
7. Add timeout and retry logic

**Deliverables:**
- Three working API endpoints
- Proper error handling
- Rate limiting implemented

---

### Phase 5: Meme Generation Flow (Days 6-7)
**Goal:** Connect UI to backend and implement complete generation workflow

**Tasks:**
1. Implement prompt submission logic
2. Connect to `/api/analyze` endpoint
3. Fetch and rank meme templates
4. Generate memes using `/api/generate`
5. Handle loading states and progress
6. Display generated memes
7. Implement error recovery

**Deliverables:**
- Complete meme generation workflow
- End-to-end functionality working
- Proper loading and error states

---

### Phase 6: Download & Share Features (Day 8)
**Goal:** Implement meme download and sharing functionality

**Tasks:**
1. Implement image download functionality
2. Implement Web Share API integration
3. Add fallback for unsupported browsers
4. Add success notifications
5. Handle edge cases

**Deliverables:**
- Working download feature
- Working share feature
- Cross-browser compatibility

---

### Phase 7: Testing & Refinement (Days 9-10)
**Goal:** Test all features and fix bugs

**Tasks:**
1. Manual testing of all flows
2. Test error scenarios
3. Test on multiple devices/browsers
4. Fix bugs and issues
5. Optimize performance
6. Refine UI/UX

**Deliverables:**
- Bug-free application
- Smooth user experience
- Performance optimized

---

### Phase 8: Deployment (Day 11)
**Goal:** Deploy to Vercel production

**Tasks:**
1. Configure Vercel project
2. Set up environment variables
3. Configure custom domain (if applicable)
4. Deploy to production
5. Verify production deployment
6. Monitor for issues

**Deliverables:**
- Live production application
- Proper environment configuration
- Monitoring in place

---

## Detailed Component Specifications

### Home Screen Components

#### `app/page.tsx` (Home Screen)
- **Purpose:** Main landing page for prompt input
- **State:**
  - `prompt`: string (controlled input)
  - `isGenerating`: boolean
  - `hasApiKey`: boolean
- **Behavior:**
  - Check for API key on mount
  - Redirect to settings if no API key
  - Validate prompt before submission
  - Show loading state during generation
  - Navigate to results on success
- **Accessibility:**
  - Proper heading hierarchy
  - ARIA labels for input
  - Keyboard navigation support

#### `components/home/PromptInput.tsx`
```typescript
interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
}
```
- **Features:**
  - Multi-line textarea
  - Character counter
  - Placeholder with example
  - Auto-focus on load
  - Auto-resize based on content

#### `components/home/GenerateButton.tsx`
```typescript
interface GenerateButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
}
```
- **Features:**
  - Loading spinner when active
  - Disabled state when no prompt
  - Prominent CTA styling
  - Keyboard accessible

---

### Settings Screen Components

#### `app/settings/page.tsx`
- **Purpose:** API key configuration
- **State:**
  - `apiKey`: string (controlled input)
  - `isValidating`: boolean
  - `validationError`: string | null
- **Behavior:**
  - Load existing API key from store
  - Validate API key format
  - Encrypt before storing (optional)
  - Show success toast on save
  - Navigate back after save

#### `components/settings/ApiKeyInput.tsx`
```typescript
interface ApiKeyInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}
```
- **Features:**
  - Password-style input (hidden by default)
  - Show/hide toggle button
  - Validation feedback
  - Secure paste support

#### `components/settings/ApiKeyInstructions.tsx`
- **Features:**
  - Clear explanation of BYOK model
  - Link to Google AI Studio
  - Step-by-step instructions
  - FAQ section (optional)

---

### Results Screen Components

#### `app/results/page.tsx`
- **Purpose:** Display generated memes
- **State:**
  - `memes`: MemeResult[]
  - `selectedMeme`: number | null
- **Behavior:**
  - Load memes from store
  - Handle empty state
  - Navigate back to home
  - Clear memes on new generation

#### `components/results/MemeGrid.tsx`
```typescript
interface MemeGridProps {
  memes: MemeResult[];
  onMemeSelect?: (index: number) => void;
}
```
- **Features:**
  - Responsive grid (2x2 on desktop, 1x1 on mobile)
  - Optional carousel mode for mobile
  - Smooth transitions
  - Skeleton loading states

#### `components/results/MemeCard.tsx`
```typescript
interface MemeCardProps {
  meme: MemeResult;
  onDownload: () => void;
  onShare: () => void;
}
```
- **Features:**
  - Image with proper aspect ratio
  - Download button
  - Share button
  - Hover/focus states
  - Loading state for actions

#### `components/results/MemeActions.tsx`
```typescript
interface MemeActionsProps {
  imageUrl: string;
  onDownload: () => void;
  onShare: () => void;
}
```
- **Features:**
  - Download icon button
  - Share icon button
  - Toast notifications for success/error
  - Disabled states during actions

---

### Shared Components

#### `components/shared/Header.tsx`
- **Features:**
  - App logo/title
  - Settings icon (navigation)
  - Back button (conditional)
  - Responsive layout

#### `components/shared/ErrorMessage.tsx`
```typescript
interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}
```
- **Features:**
  - User-friendly error text
  - Optional retry button
  - Icon for visual feedback
  - Dismissable option

#### `components/shared/LoadingState.tsx`
```typescript
interface LoadingStateProps {
  message?: string;
  progress?: number; // 0-100
}
```
- **Features:**
  - Spinner animation
  - Optional progress bar
  - Status message
  - Centered layout

---

## API Endpoints

### `/api/templates` - Search Meme Templates

**Method:** POST

**Request Body:**
```typescript
{
  keywords: string[];  // Search keywords from prompt analysis
  limit?: number;      // Max templates to return (default: 10)
}
```

**Response:**
```typescript
{
  success: boolean;
  templates: Array<{
    id: string;
    name: string;
    url: string;
    width: number;
    height: number;
    box_count: number;
  }>;
  error?: string;
}
```

**Implementation:**
1. Receive keywords from client
2. Call Imgflip `get_memes` endpoint (public, no auth)
3. Filter templates by keyword matching
4. Rank by popularity and relevance
5. Return top N templates

**Error Handling:**
- Network errors → retry once
- No matches → return top popular memes
- API errors → return cached templates

---

### `/api/analyze` - Analyze Prompt

**Method:** POST

**Headers:**
```
Authorization: Bearer <user_api_key>
```

**Request Body:**
```typescript
{
  prompt: string;  // User's meme idea
}
```

**Response:**
```typescript
{
  success: boolean;
  analysis: {
    keywords: string[];           // For template search
    captions: Array<{             // Suggested captions
      top: string;
      bottom: string;
    }>;
    context: string;              // Meme context/theme
  };
  error?: string;
}
```

**Implementation:**
1. Extract API key from Authorization header
2. Validate API key format
3. Create Gemini API client with user's key
4. Send prompt to `gemini-2.5-flash` with structured output
5. Parse response for keywords and captions
6. Return structured analysis

**Prompt Template:**
```
Analyze this meme idea and provide:
1. 3-5 keywords for finding the right meme template
2. 3 sets of captions (top text and bottom text) that would be funny
3. The context/theme of the meme

Meme idea: "{user_prompt}"

Respond in JSON format:
{
  "keywords": ["keyword1", "keyword2", ...],
  "captions": [
    {"top": "...", "bottom": "..."},
    ...
  ],
  "context": "..."
}
```

**Error Handling:**
- Invalid API key → 401 Unauthorized
- Rate limit → 429 Too Many Requests
- Gemini API error → 502 Bad Gateway
- Timeout (>10s) → 504 Gateway Timeout

**Rate Limiting:**
- 10 requests per minute per IP
- 100 requests per hour per IP

---

### `/api/generate` - Generate Meme Image

**Method:** POST

**Headers:**
```
Authorization: Bearer <user_api_key>
```

**Request Body:**
```typescript
{
  templateUrl: string;        // Imgflip template image URL
  caption: {
    top: string;
    bottom: string;
  };
  templateName?: string;      // For context
}
```

**Response:**
```typescript
{
  success: boolean;
  meme: {
    id: string;               // Unique ID
    url: string;              // Generated meme URL
    templateName: string;
    caption: {
      top: string;
      bottom: string;
    };
    generatedAt: string;      // ISO timestamp
  };
  error?: string;
}
```

**Implementation:**
1. Extract API key from Authorization header
2. Validate inputs
3. Download template image from Imgflip URL
4. Convert image to base64
5. Create Gemini API client with user's key
6. Send to `gemini-2.5-flash-image-preview` with prompt:
   ```
   Add the following text to this meme image:
   Top text: "{caption.top}"
   Bottom text: "{caption.bottom}"

   Use the standard meme text style:
   - White text with black outline
   - Impact font or similar bold font
   - Top text at the top, bottom text at the bottom
   - Text should be large and readable
   ```
7. Receive generated image
8. Upload to temporary storage or return as base64
9. Return meme data

**Error Handling:**
- Invalid API key → 401 Unauthorized
- Invalid template URL → 400 Bad Request
- Image generation failure → 502 Bad Gateway
- Timeout (>15s) → 504 Gateway Timeout

**Rate Limiting:**
- 5 requests per minute per IP
- 50 requests per hour per IP

**Cost Considerations:**
- Each image generation = 1290 tokens = $0.039
- Client should be warned about API costs

---

## State Management

### Zustand Store Structure

#### `lib/store/useAppStore.ts`
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiKeySlice, ApiKeySlice } from './slices/apiKeySlice';
import { memeSlice, MemeSlice } from './slices/memeSlice';
import { uiSlice, UISlice } from './slices/uiSlice';

export type AppStore = ApiKeySlice & MemeSlice & UISlice;

export const useAppStore = create<AppStore>()(
  persist(
    (set, get, api) => ({
      ...apiKeySlice(set, get, api),
      ...memeSlice(set, get, api),
      ...uiSlice(set, get, api),
    }),
    {
      name: 'meme-nano-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        apiKey: state.apiKey, // Only persist API key
      }),
    }
  )
);
```

---

#### `lib/store/slices/apiKeySlice.ts`
```typescript
export interface ApiKeySlice {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  hasApiKey: () => boolean;
}

export const apiKeySlice = (set, get): ApiKeySlice => ({
  apiKey: null,

  setApiKey: (key: string) => {
    // Optional: Encrypt key before storing
    set({ apiKey: key });
  },

  clearApiKey: () => {
    set({ apiKey: null });
  },

  hasApiKey: () => {
    return !!get().apiKey;
  },
});
```

---

#### `lib/store/slices/memeSlice.ts`
```typescript
import { MemeResult } from '@/lib/types/meme';

export interface MemeSlice {
  currentPrompt: string;
  generatedMemes: MemeResult[];
  setCurrentPrompt: (prompt: string) => void;
  setGeneratedMemes: (memes: MemeResult[]) => void;
  clearMemes: () => void;
}

export const memeSlice = (set, get): MemeSlice => ({
  currentPrompt: '',
  generatedMemes: [],

  setCurrentPrompt: (prompt: string) => {
    set({ currentPrompt: prompt });
  },

  setGeneratedMemes: (memes: MemeResult[]) => {
    set({ generatedMemes: memes });
  },

  clearMemes: () => {
    set({ generatedMemes: [], currentPrompt: '' });
  },
});
```

---

#### `lib/store/slices/uiSlice.ts`
```typescript
export interface UISlice {
  isGenerating: boolean;
  generationProgress: number; // 0-100
  error: string | null;
  setGenerating: (isGenerating: boolean) => void;
  setGenerationProgress: (progress: number) => void;
  setError: (error: string | null) => void;
}

export const uiSlice = (set, get): UISlice => ({
  isGenerating: false,
  generationProgress: 0,
  error: null,

  setGenerating: (isGenerating: boolean) => {
    set({ isGenerating });
  },

  setGenerationProgress: (progress: number) => {
    set({ generationProgress: Math.min(100, Math.max(0, progress)) });
  },

  setError: (error: string | null) => {
    set({ error });
  },
});
```

---

### Custom Hooks

#### `lib/hooks/useApiKey.ts`
```typescript
export const useApiKey = () => {
  const apiKey = useAppStore((state) => state.apiKey);
  const setApiKey = useAppStore((state) => state.setApiKey);
  const clearApiKey = useAppStore((state) => state.clearApiKey);
  const hasApiKey = useAppStore((state) => state.hasApiKey);

  return { apiKey, setApiKey, clearApiKey, hasApiKey };
};
```

#### `lib/hooks/useMemeGeneration.ts`
```typescript
export const useMemeGeneration = () => {
  const apiKey = useAppStore((state) => state.apiKey);
  const setGenerating = useAppStore((state) => state.setGenerating);
  const setProgress = useAppStore((state) => state.setGenerationProgress);
  const setError = useAppStore((state) => state.setError);
  const setGeneratedMemes = useAppStore((state) => state.setGeneratedMemes);

  const generateMemes = async (prompt: string) => {
    // Implementation
  };

  return { generateMemes };
};
```

---

## Security Implementation

### API Key Protection

1. **Client-Side Storage:**
   - Store API key in localStorage (encrypted optional)
   - Never expose in URLs or logs
   - Clear on logout/settings

2. **Transmission:**
   - Always use HTTPS (enforced by Vercel)
   - Send API key in Authorization header
   - Never in URL query parameters

3. **Server-Side Handling:**
   - API key only used in-memory during request
   - Never logged or stored on server
   - Validated format before use

---

### Rate Limiting

**Implementation using Vercel Edge Middleware:**

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimit = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  const ip = request.ip || 'anonymous';
  const now = Date.now();

  // Clean up expired entries
  for (const [key, value] of rateLimit.entries()) {
    if (value.resetTime < now) {
      rateLimit.delete(key);
    }
  }

  // Check rate limit
  const limit = rateLimit.get(ip);
  if (limit && limit.count > 10) { // 10 requests per minute
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // Update rate limit
  rateLimit.set(ip, {
    count: (limit?.count || 0) + 1,
    resetTime: now + 60000, // 1 minute
  });

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

---

### Input Validation

**Prompt Validation:**
```typescript
// lib/utils/validators.ts
export const validatePrompt = (prompt: string): { valid: boolean; error?: string } => {
  if (!prompt || prompt.trim().length === 0) {
    return { valid: false, error: 'Prompt cannot be empty' };
  }

  if (prompt.length > 500) {
    return { valid: false, error: 'Prompt must be less than 500 characters' };
  }

  if (prompt.length < 5) {
    return { valid: false, error: 'Prompt must be at least 5 characters' };
  }

  // Check for malicious content
  const maliciousPatterns = [/<script/i, /javascript:/i, /on\w+=/i];
  if (maliciousPatterns.some(pattern => pattern.test(prompt))) {
    return { valid: false, error: 'Invalid characters detected' };
  }

  return { valid: true };
};
```

**API Key Validation:**
```typescript
export const validateApiKey = (key: string): { valid: boolean; error?: string } => {
  if (!key || key.trim().length === 0) {
    return { valid: false, error: 'API key cannot be empty' };
  }

  // Gemini API keys typically start with "AIza" and are 39 characters
  if (!key.startsWith('AIza')) {
    return { valid: false, error: 'Invalid API key format' };
  }

  if (key.length !== 39) {
    return { valid: false, error: 'Invalid API key length' };
  }

  return { valid: true };
};
```

---

### CORS Configuration

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_APP_URL || '*' },
          { key: 'Access-Control-Allow-Methods', value: 'POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};
```

---

## Testing Strategy

### Manual Testing Checklist

#### Home Screen
- [ ] Prompt input accepts text
- [ ] Prompt input shows placeholder
- [ ] Character counter works correctly
- [ ] Generate button disabled when no prompt
- [ ] Generate button shows loading state
- [ ] Redirects to settings if no API key
- [ ] Error message shown for invalid prompt
- [ ] Keyboard navigation works

#### Settings Screen
- [ ] API key input accepts text
- [ ] Show/hide toggle works
- [ ] Save button stores API key
- [ ] Success toast shown on save
- [ ] Navigation back works
- [ ] Instructions are clear
- [ ] Link to Google AI Studio works
- [ ] Keyboard navigation works

#### Results Screen
- [ ] Memes display in grid
- [ ] Grid is responsive (2x2 desktop, 1x1 mobile)
- [ ] Download button downloads image
- [ ] Share button opens share dialog
- [ ] Back button returns to home
- [ ] Empty state shown when no memes
- [ ] Loading states work correctly
- [ ] Error states display properly

#### Meme Generation Flow
- [ ] Prompt analysis completes successfully
- [ ] Templates are fetched from Imgflip
- [ ] Memes are generated with correct captions
- [ ] Loading progress is shown
- [ ] Error handling works for each step
- [ ] Generated memes display correctly
- [ ] Generation completes within 15 seconds

#### Error Scenarios
- [ ] Invalid API key shows error
- [ ] Network failure shows error
- [ ] API timeout shows error
- [ ] Rate limit shows error
- [ ] Invalid prompt shows error
- [ ] Retry functionality works

#### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

#### Accessibility Testing
- [ ] Screen reader compatible
- [ ] Keyboard navigation complete
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Semantic HTML used

---

### Automated Testing (Future Enhancement)

**Unit Tests (Vitest):**
- Utility functions (validators, download, share)
- Store slices and actions
- API response parsing

**Integration Tests (Playwright):**
- Complete meme generation flow
- Settings management
- Download and share functionality

**E2E Tests (Playwright):**
- Full user journey from prompt to download
- Error recovery flows
- Multi-device testing

---

## Performance Optimization

### Next.js Optimizations

1. **App Router Features:**
   - Server Components for static content
   - Client Components for interactive elements
   - Automatic code splitting
   - Route-based lazy loading

2. **Image Optimization:**
   ```typescript
   import Image from 'next/image';

   <Image
     src={meme.url}
     alt={meme.templateName}
     width={512}
     height={512}
     quality={90}
     placeholder="blur"
     blurDataURL={blurDataUrl}
   />
   ```

3. **Font Optimization:**
   ```typescript
   // app/layout.tsx
   import { Inter } from 'next/font/google';

   const inter = Inter({
     subsets: ['latin'],
     display: 'swap',
     variable: '--font-inter',
   });
   ```

4. **Metadata Optimization:**
   ```typescript
   export const metadata = {
     title: 'MemeNano - AI Meme Generator',
     description: 'Create memes instantly with AI',
     openGraph: {
       title: 'MemeNano',
       description: 'Create memes instantly with AI',
       images: ['/og-image.png'],
     },
   };
   ```

---

### Bundle Optimization

1. **Dynamic Imports:**
   ```typescript
   const MemeActions = dynamic(() => import('@/components/results/MemeActions'), {
     loading: () => <LoadingSpinner />,
   });
   ```

2. **Tree Shaking:**
   - Import only needed components
   - Use named imports
   - Avoid barrel exports for large libraries

3. **Code Splitting:**
   - Automatic by Next.js per route
   - Manual with `dynamic()`

---

### Runtime Performance

1. **Memoization:**
   ```typescript
   import { useMemo, useCallback } from 'react';

   const MemeCard = ({ meme, onDownload, onShare }) => {
     const handleDownload = useCallback(() => {
       onDownload(meme.url);
     }, [meme.url, onDownload]);

     const imageAlt = useMemo(() =>
       `${meme.templateName} meme: ${meme.caption.top}`,
       [meme.templateName, meme.caption.top]
     );

     return (/* ... */);
   };
   ```

2. **Virtualization (if needed):**
   - Use for long lists of memes (future)
   - Current MVP shows max 4 memes, so not needed

3. **Debouncing:**
   ```typescript
   // For prompt input
   const debouncedValidation = useMemo(
     () => debounce((value: string) => {
       validatePrompt(value);
     }, 300),
     []
   );
   ```

---

### API Performance

1. **Request Optimization:**
   - Parallel API calls where possible
   - Request deduplication
   - Abort stale requests

2. **Caching:**
   ```typescript
   // Cache Imgflip templates for 1 hour
   export async function GET() {
     return Response.json(templates, {
       headers: {
         'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
       },
     });
   }
   ```

3. **Compression:**
   - Automatically handled by Vercel
   - gzip/brotli compression

---

### Loading Experience

1. **Progressive Loading:**
   - Show UI immediately
   - Load data progressively
   - Use skeleton screens

2. **Optimistic Updates:**
   - Update UI immediately
   - Rollback on error

3. **Progress Indicators:**
   - Show clear progress during generation
   - Estimate time remaining
   - Break into steps (analyzing, finding templates, generating)

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance

#### Perceivable

1. **Text Alternatives:**
   - All images have alt text
   - Icons have aria-labels
   - Loading states announced to screen readers

2. **Color Contrast:**
   - Minimum 4.5:1 for normal text
   - Minimum 3:1 for large text
   - Use TailwindCSS color palette with good contrast

3. **Responsive Text:**
   - Support text zoom up to 200%
   - Use relative units (rem/em)
   - Avoid fixed pixel sizes

---

#### Operable

1. **Keyboard Accessible:**
   - All interactive elements focusable
   - Logical tab order
   - No keyboard traps
   - Skip links where needed

2. **Focus Indicators:**
   ```typescript
   // tailwind.config.ts
   module.exports = {
     theme: {
       extend: {
         ringWidth: {
           DEFAULT: '2px',
         },
         ringColor: {
           DEFAULT: 'theme("colors.blue.500")',
         },
       },
     },
   };
   ```

3. **Timing:**
   - No time limits on interactions
   - User controls for auto-advancing content

---

#### Understandable

1. **Readable:**
   - Clear, simple language
   - Avoid jargon
   - Consistent terminology

2. **Predictable:**
   - Consistent navigation
   - No unexpected context changes
   - Clear button labels

3. **Input Assistance:**
   - Clear error messages
   - Input validation feedback
   - Instructions when needed

---

#### Robust

1. **Compatible:**
   - Valid HTML5 markup
   - Proper ARIA attributes
   - Works with assistive technologies

2. **Semantic HTML:**
   ```typescript
   <main>
     <h1>MemeNano</h1>
     <form>
       <label htmlFor="prompt">Describe your meme idea</label>
       <textarea id="prompt" aria-describedby="prompt-help" />
       <span id="prompt-help">Enter a description of the meme you want to create</span>
       <button type="submit">Generate</button>
     </form>
   </main>
   ```

---

### Testing Accessibility

1. **Automated Tools:**
   - axe DevTools browser extension
   - Lighthouse accessibility audit
   - WAVE browser extension

2. **Manual Testing:**
   - Keyboard-only navigation
   - Screen reader testing (NVDA, JAWS, VoiceOver)
   - Zoom to 200%
   - Color blindness simulation

3. **User Testing:**
   - Test with users with disabilities
   - Gather feedback on usability
   - Iterate based on feedback

---

## Deployment Configuration

### Environment Variables

**`.env.example`:**
```bash
# App Configuration
NEXT_PUBLIC_APP_URL=https://meme-nano.vercel.app
NEXT_PUBLIC_APP_NAME=MemeNano

# API Configuration (Optional - for server-side calls)
# User brings their own key for client-side calls
IMGFLIP_USERNAME=
IMGFLIP_PASSWORD=

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=

# Feature Flags (Optional)
NEXT_PUBLIC_ENABLE_SHARE=true
NEXT_PUBLIC_ENABLE_DOWNLOAD=true
NEXT_PUBLIC_MAX_MEMES=4
```

**`.env.local`:** (gitignored, for local development)
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### Vercel Configuration

**`vercel.json`:**
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_APP_URL": "@app-url"
  }
}
```

---

### Next.js Configuration

**`next.config.ts`:**
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.imgflip.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

### TypeScript Configuration

**`tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
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
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

### TailwindCSS Configuration

**`tailwind.config.ts`:**
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

---

### Package.json Scripts

**`package.json`:**
```json
{
  "name": "meme-nano-web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\""
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^4.5.0",
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.344.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "typescript": "^5.3.3",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.33",
    "autoprefixer": "^10.4.17",
    "eslint": "^8.56.0",
    "eslint-config-next": "^15.0.0",
    "prettier": "^3.2.4",
    "prettier-plugin-tailwindcss": "^0.5.11"
  }
}
```

---

## Files to Create/Modify

### Core Configuration Files (Create)

1. `/package.json` - Project dependencies and scripts
2. `/next.config.ts` - Next.js configuration
3. `/tailwind.config.ts` - TailwindCSS configuration
4. `/tsconfig.json` - TypeScript configuration
5. `/components.json` - shadcn/ui configuration
6. `/.env.example` - Environment variables template
7. `/.gitignore` - Git ignore file
8. `/README.md` - Project documentation

---

### App Router Files (Create)

#### Root Layout & Pages
9. `/app/layout.tsx` - Root layout with global styles
10. `/app/page.tsx` - Home screen
11. `/app/globals.css` - Global styles
12. `/app/error.tsx` - Global error boundary

#### Settings Screen
13. `/app/settings/page.tsx` - Settings screen

#### Results Screen
14. `/app/results/page.tsx` - Results screen

#### API Routes
15. `/app/api/analyze/route.ts` - Prompt analysis endpoint
16. `/app/api/generate/route.ts` - Meme generation endpoint
17. `/app/api/templates/route.ts` - Template search endpoint

---

### UI Components (Create)

#### shadcn/ui Base Components
18. `/components/ui/button.tsx` - Button component
19. `/components/ui/input.tsx` - Input component
20. `/components/ui/textarea.tsx` - Textarea component
21. `/components/ui/card.tsx` - Card component
22. `/components/ui/toast.tsx` - Toast notification component
23. `/components/ui/loading-spinner.tsx` - Loading spinner

#### Home Screen Components
24. `/components/home/PromptInput.tsx` - Prompt input component
25. `/components/home/GenerateButton.tsx` - Generate button

#### Settings Screen Components
26. `/components/settings/ApiKeyInput.tsx` - API key input
27. `/components/settings/ApiKeyInstructions.tsx` - Instructions

#### Results Screen Components
28. `/components/results/MemeGrid.tsx` - Meme grid/carousel
29. `/components/results/MemeCard.tsx` - Individual meme card
30. `/components/results/MemeActions.tsx` - Download/Share buttons

#### Shared Components
31. `/components/shared/Header.tsx` - App header
32. `/components/shared/ErrorMessage.tsx` - Error display
33. `/components/shared/LoadingState.tsx` - Loading state

---

### State Management (Create)

34. `/lib/store/useAppStore.ts` - Main Zustand store
35. `/lib/store/slices/apiKeySlice.ts` - API key slice
36. `/lib/store/slices/memeSlice.ts` - Meme slice
37. `/lib/store/slices/uiSlice.ts` - UI slice
38. `/lib/hooks/useApiKey.ts` - API key hook
39. `/lib/hooks/useMemeGeneration.ts` - Meme generation hook

---

### Services & Utilities (Create)

40. `/lib/services/gemini.ts` - Gemini API client
41. `/lib/services/imgflip.ts` - Imgflip API client
42. `/lib/utils/validators.ts` - Input validation
43. `/lib/utils/download.ts` - Download utilities
44. `/lib/utils/share.ts` - Share utilities
45. `/lib/utils/cn.ts` - Class name utility (from shadcn/ui)

---

### Type Definitions (Create)

46. `/lib/types/api.ts` - API types
47. `/lib/types/meme.ts` - Meme types
48. `/lib/types/store.ts` - Store types

---

### Configuration (Create)

49. `/config/site.ts` - Site metadata
50. `/config/constants.ts` - App constants

---

### Static Assets (Create)

51. `/public/favicon.ico` - Favicon
52. `/public/og-image.png` - Open Graph image

---

### Documentation (Existing - No Changes)

- `/docs/product-overview-pdr.md` - Product requirements
- `/docs/screen-01.png` - Home wireframe
- `/docs/screen-02.png` - Results wireframe
- `/docs/screen-03.png` - Settings wireframe

---

## Implementation Checklist

### Phase 1: Project Setup

- [ ] Initialize Next.js 15 project with TypeScript
  ```bash
  npx create-next-app@latest meme-nano-web --typescript --tailwind --app --src-dir=false
  ```

- [ ] Install dependencies
  ```bash
  npm install zustand @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react
  ```

- [ ] Initialize shadcn/ui
  ```bash
  npx shadcn@latest init
  ```

- [ ] Add shadcn/ui components
  ```bash
  npx shadcn@latest add button input textarea card toast
  ```

- [ ] Create folder structure
  - [ ] `/app` directory structure
  - [ ] `/components` directory structure
  - [ ] `/lib` directory structure
  - [ ] `/config` directory
  - [ ] `/public` assets

- [ ] Configure environment variables
  - [ ] Create `.env.example`
  - [ ] Create `.env.local`

- [ ] Set up ESLint and Prettier
  - [ ] Configure `.eslintrc.json`
  - [ ] Configure `.prettierrc`
  - [ ] Add format script to `package.json`

- [ ] Test development server
  ```bash
  npm run dev
  ```

---

### Phase 2: Core UI Components

- [ ] Install and configure all shadcn/ui components
  - [ ] Button
  - [ ] Input
  - [ ] Textarea
  - [ ] Card
  - [ ] Toast

- [ ] Create shared components
  - [ ] Header with navigation
  - [ ] ErrorMessage component
  - [ ] LoadingState component
  - [ ] LoadingSpinner component

- [ ] Create Home screen components
  - [ ] PromptInput with character counter
  - [ ] GenerateButton with loading state

- [ ] Create Settings screen components
  - [ ] ApiKeyInput with show/hide toggle
  - [ ] ApiKeyInstructions with links

- [ ] Create Results screen components
  - [ ] MemeGrid with responsive layout
  - [ ] MemeCard with image display
  - [ ] MemeActions with download/share

- [ ] Implement responsive layouts
  - [ ] Test on mobile (375px)
  - [ ] Test on tablet (768px)
  - [ ] Test on desktop (1440px)

- [ ] Add CSS animations and transitions
  - [ ] Button hover states
  - [ ] Card hover states
  - [ ] Loading animations
  - [ ] Page transitions

---

### Phase 3: State Management

- [ ] Set up Zustand store structure
  - [ ] Create main store file
  - [ ] Configure persist middleware
  - [ ] Set up localStorage

- [ ] Create store slices
  - [ ] apiKeySlice with CRUD operations
  - [ ] memeSlice with generation state
  - [ ] uiSlice with loading/error state

- [ ] Create custom hooks
  - [ ] useApiKey hook
  - [ ] useMemeGeneration hook
  - [ ] useToast hook (optional)

- [ ] Test state persistence
  - [ ] API key persists across sessions
  - [ ] State rehydrates correctly
  - [ ] State clears on logout

- [ ] Implement validation
  - [ ] API key format validation
  - [ ] Prompt validation
  - [ ] Input sanitization

---

### Phase 4: API Routes

- [ ] Create `/api/templates` endpoint
  - [ ] Implement GET request handler
  - [ ] Integrate Imgflip API
  - [ ] Add error handling
  - [ ] Add response caching

- [ ] Create `/api/analyze` endpoint
  - [ ] Implement POST request handler
  - [ ] Extract and validate API key
  - [ ] Integrate Gemini 2.5 Flash
  - [ ] Parse and structure response
  - [ ] Add timeout handling
  - [ ] Add error handling

- [ ] Create `/api/generate` endpoint
  - [ ] Implement POST request handler
  - [ ] Validate inputs
  - [ ] Download template image
  - [ ] Integrate Gemini 2.5 Flash Image
  - [ ] Return generated image
  - [ ] Add timeout handling
  - [ ] Add error handling

- [ ] Implement rate limiting
  - [ ] Add middleware for rate limiting
  - [ ] Set limits per endpoint
  - [ ] Add IP-based tracking
  - [ ] Return 429 for exceeded limits

- [ ] Add request validation
  - [ ] Validate request body
  - [ ] Sanitize inputs
  - [ ] Check authentication

- [ ] Add logging (optional)
  - [ ] Log errors (no sensitive data)
  - [ ] Log performance metrics

---

### Phase 5: Meme Generation Flow

- [ ] Implement prompt submission
  - [ ] Validate prompt on client
  - [ ] Show loading state
  - [ ] Handle keyboard shortcuts (Enter)

- [ ] Connect to analysis endpoint
  - [ ] Send prompt with API key
  - [ ] Handle response
  - [ ] Update progress (25%)

- [ ] Fetch meme templates
  - [ ] Call templates endpoint with keywords
  - [ ] Rank templates by relevance
  - [ ] Update progress (50%)

- [ ] Generate memes
  - [ ] Loop through top 4 templates
  - [ ] Call generate endpoint for each
  - [ ] Update progress incrementally
  - [ ] Handle partial failures

- [ ] Display results
  - [ ] Navigate to results page
  - [ ] Show generated memes
  - [ ] Enable download/share

- [ ] Error handling
  - [ ] Show user-friendly errors
  - [ ] Provide retry option
  - [ ] Log errors for debugging

- [ ] Loading states
  - [ ] Show progress bar
  - [ ] Show step-by-step status
  - [ ] Prevent duplicate submissions

---

### Phase 6: Download & Share

- [ ] Implement download functionality
  - [ ] Create download utility
  - [ ] Convert image URL to blob
  - [ ] Trigger browser download
  - [ ] Add success toast

- [ ] Implement share functionality
  - [ ] Check for Web Share API support
  - [ ] Implement Web Share API
  - [ ] Add fallback for unsupported browsers
  - [ ] Copy link to clipboard as fallback
  - [ ] Add success toast

- [ ] Handle edge cases
  - [ ] CORS issues with images
  - [ ] Large image file sizes
  - [ ] Network failures during download

- [ ] Test across browsers
  - [ ] Chrome (desktop & mobile)
  - [ ] Firefox (desktop & mobile)
  - [ ] Safari (desktop & mobile)

---

### Phase 7: Testing & Refinement

- [ ] Manual testing
  - [ ] Test complete happy path
  - [ ] Test all error scenarios
  - [ ] Test on multiple devices
  - [ ] Test on multiple browsers

- [ ] Accessibility testing
  - [ ] Run axe DevTools
  - [ ] Run Lighthouse audit
  - [ ] Test with keyboard only
  - [ ] Test with screen reader

- [ ] Performance testing
  - [ ] Run Lighthouse performance audit
  - [ ] Check bundle size
  - [ ] Test with slow 3G
  - [ ] Optimize images

- [ ] Bug fixes
  - [ ] Create bug list
  - [ ] Prioritize by severity
  - [ ] Fix critical bugs
  - [ ] Fix high-priority bugs

- [ ] UI/UX refinements
  - [ ] Gather user feedback
  - [ ] Improve error messages
  - [ ] Improve loading states
  - [ ] Polish animations

- [ ] Security review
  - [ ] Review API key handling
  - [ ] Review input validation
  - [ ] Review rate limiting
  - [ ] Check for XSS vulnerabilities

---

### Phase 8: Deployment

- [ ] Prepare for deployment
  - [ ] Run production build locally
  - [ ] Test production build
  - [ ] Fix any build errors

- [ ] Configure Vercel
  - [ ] Connect GitHub repository
  - [ ] Configure environment variables
  - [ ] Set up custom domain (optional)

- [ ] Deploy to production
  - [ ] Push to main branch
  - [ ] Verify deployment
  - [ ] Test live application

- [ ] Post-deployment
  - [ ] Monitor for errors
  - [ ] Monitor performance
  - [ ] Set up analytics (optional)
  - [ ] Create user documentation

- [ ] Launch
  - [ ] Announce to users
  - [ ] Gather feedback
  - [ ] Plan next iteration

---

## Risk Assessment & Mitigation

### Technical Risks

#### Risk 1: API Cost Overruns
**Probability:** Medium
**Impact:** High
**Mitigation:**
- Implement rate limiting per IP
- Add warnings about API costs in settings
- Consider adding a "cost estimate" before generation
- Add server-side usage tracking (optional)

#### Risk 2: API Key Exposure
**Probability:** Low
**Impact:** Critical
**Mitigation:**
- Never log API keys
- Use Authorization headers only
- Implement API proxy pattern
- Clear keys from memory after use
- Add encryption for localStorage (optional)

#### Risk 3: Generation Timeout
**Probability:** Medium
**Impact:** Medium
**Mitigation:**
- Set appropriate timeouts (15s)
- Show clear progress indicators
- Implement retry logic
- Allow partial results (e.g., 2/4 memes generated)

#### Risk 4: Poor Meme Quality
**Probability:** High
**Impact:** Medium
**Mitigation:**
- Craft detailed prompts for Gemini
- Provide context and examples
- Implement template ranking algorithm
- Allow users to regenerate
- Plan for future: user feedback loop

#### Risk 5: Template Search Failures
**Probability:** Medium
**Impact:** Medium
**Mitigation:**
- Cache popular templates
- Fallback to top 100 popular memes
- Implement fuzzy matching
- Handle Imgflip API errors gracefully

---

### Product Risks

#### Risk 6: User Confusion About BYOK
**Probability:** High
**Impact:** High
**Mitigation:**
- Clear instructions in settings
- Link directly to Google AI Studio
- Step-by-step guide with screenshots
- FAQ section (future enhancement)
- Consider tutorial on first use

#### Risk 7: Poor First-Time Experience
**Probability:** Medium
**Impact:** High
**Mitigation:**
- Redirect to settings if no API key
- Show example prompts
- Provide sample memes
- Add onboarding flow (future enhancement)

#### Risk 8: Mobile Usability Issues
**Probability:** Medium
**Impact:** High
**Mitigation:**
- Mobile-first design approach
- Test on real devices
- Optimize for touch interactions
- Ensure proper viewport configuration

---

### Business Risks

#### Risk 9: API Availability
**Probability:** Low
**Impact:** Critical
**Mitigation:**
- Use stable Gemini API versions
- Monitor API status
- Add status page (future enhancement)
- Implement graceful degradation

#### Risk 10: Scalability Limits
**Probability:** Low
**Impact:** Medium
**Mitigation:**
- Leverage Vercel's auto-scaling
- Use Edge Functions for low latency
- Implement efficient caching
- Monitor usage patterns

---

## Future Enhancements (Post-MVP)

### Phase 2 Features (Not in Scope for MVP)

1. **User Accounts**
   - Save meme history
   - Personal meme library
   - Usage tracking

2. **Advanced Meme Editing**
   - Custom text positioning
   - Font selection
   - Color customization
   - Multiple text boxes

3. **Template Management**
   - Upload custom templates
   - Favorite templates
   - Template categories

4. **Social Features**
   - Share to social media directly
   - Meme gallery
   - Trending memes
   - Community voting

5. **Analytics**
   - Usage statistics
   - Popular meme types
   - Generation success rates

6. **Monetization**
   - Premium features
   - API credits system
   - White-label solution

7. **Internationalization**
   - Multi-language support
   - Localized meme templates
   - Cultural context awareness

8. **AI Improvements**
   - Fine-tuned models
   - Better caption generation
   - Context-aware template selection
   - Learn from user feedback

---

## Conclusion

This implementation plan provides a comprehensive roadmap for building MemeNano MVP. By following the phased approach, we ensure:

1. **Clear Structure:** Well-organized codebase following Next.js best practices
2. **Security First:** Proper API key handling and input validation
3. **User-Centric:** Intuitive UX with clear feedback and error handling
4. **Performance:** Optimized bundle size and runtime performance
5. **Accessibility:** WCAG 2.1 AA compliance for inclusive design
6. **Maintainability:** Clean code with TypeScript and proper separation of concerns

### Success Metrics

- **Performance:** Page load < 3s, meme generation < 15s
- **Accessibility:** Lighthouse accessibility score > 90
- **Quality:** Meme generation success rate > 80%
- **Usability:** User completes flow without errors
- **Security:** No API key exposure or security vulnerabilities

### Next Steps

1. Review and approve this plan
2. Set up development environment
3. Begin Phase 1 implementation
4. Regular check-ins and testing
5. Deploy MVP to production
6. Gather user feedback
7. Plan Phase 2 enhancements

---

**Document Version:** 1.0
**Last Updated:** September 30, 2025
**Author:** AI Planner Agent
**Status:** Ready for Implementation