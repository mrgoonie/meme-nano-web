# MemeNano Architecture Documentation

## Table of Contents
- [System Overview](#system-overview)
- [Architecture Patterns](#architecture-patterns)
- [Application Structure](#application-structure)
- [Data Flow](#data-flow)
- [API Design](#api-design)
- [State Management](#state-management)
- [Security Architecture](#security-architecture)
- [Performance Optimization](#performance-optimization)

## System Overview

MemeNano is built as a full-stack Next.js 15 application using the App Router architecture. The application follows a client-server pattern where sensitive operations (API calls with user credentials) are proxied through serverless API routes.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          React Components (Client)                   │   │
│  │  - User Input                                        │   │
│  │  - UI Rendering                                      │   │
│  │  - State Management (Zustand)                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          │ HTTPS                             │
│                          ▼                                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                Next.js API Routes (Vercel Edge Functions)   │
│  ┌─────────────┬─────────────┬────────────────┐            │
│  │  /analyze   │  /templates │   /generate    │            │
│  │  - Prompt   │  - Template │   - Image      │            │
│  │    analysis │    search   │     generation │            │
│  │  - Caption  │  - Filtering│   - Text       │            │
│  │    creation │             │     overlay    │            │
│  └─────────────┴─────────────┴────────────────┘            │
│                          │                                   │
└──────────────────────────┼──────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
                ▼                     ▼
┌──────────────────────┐  ┌─────────────────────┐
│   Gemini API         │  │   Imgflip API       │
│   - Text Generation  │  │   - Template DB     │
│   - Image Generation │  │   - Meme Search     │
└──────────────────────┘  └─────────────────────┘
```

## Architecture Patterns

### 1. API Proxy Pattern

The application uses an API proxy pattern to protect user API keys and prevent client-side exposure.

**Flow:**
1. Client sends request to Next.js API route with API key in Authorization header
2. API route validates and uses the key to call external APIs
3. API route returns processed data to client
4. API key never stored on server (in-memory only during request)

**Benefits:**
- API keys not exposed in client-side code
- Protection against network inspection
- Centralized rate limiting and error handling
- Consistent security headers

### 2. Component-Based Architecture

The UI is built using a component-based architecture with clear separation of concerns:

- **Pages**: Route-level components (`app/*/page.tsx`)
- **Feature Components**: Page-specific components (`components/home/`, `components/results/`)
- **UI Components**: Reusable UI primitives (`components/ui/`)
- **Layout Components**: Shared layout elements (`components/layout/`)

### 3. Server and Client Components

Next.js 15 App Router distinguishes between server and client components:

- **Server Components**: Static pages, layouts (default)
- **Client Components**: Interactive UI with state (`'use client'` directive)

**Strategy:**
- Keep server components by default
- Use client components only when needed (interactivity, browser APIs)
- Minimize client-side JavaScript bundle size

## Application Structure

### Folder Structure Breakdown

```
meme-nano-web/
│
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout (metadata, providers)
│   ├── page.tsx                      # Root page (redirects to /home)
│   │
│   ├── home/                         # Home page route
│   │   └── page.tsx                  # Main meme input interface
│   │
│   ├── results/                      # Results page route
│   │   └── page.tsx                  # Display generated memes
│   │
│   ├── settings/                     # Settings page route
│   │   └── page.tsx                  # API key configuration
│   │
│   └── api/                          # API routes (serverless)
│       ├── analyze/
│       │   └── route.ts              # POST: Analyze prompt & generate captions
│       ├── templates/
│       │   └── route.ts              # POST: Search meme templates
│       └── generate/
│           └── route.ts              # POST: Generate meme images
│
├── components/                       # React components
│   ├── home/                         # Home page components
│   ├── layout/                       # Layout components (header, footer)
│   ├── results/                      # Results display components
│   ├── settings/                     # Settings form components
│   └── ui/                           # shadcn/ui primitives
│       ├── button.tsx                # Button component
│       ├── card.tsx                  # Card component
│       ├── input.tsx                 # Input component
│       └── textarea.tsx              # Textarea component
│
├── lib/                              # Core application logic
│   ├── api/                          # API client functions
│   │   ├── gemini.ts                 # Gemini API integration
│   │   └── imgflip.ts                # Imgflip API integration
│   │
│   ├── config/                       # Configuration
│   │   └── constants.ts              # App-wide constants
│   │
│   ├── store/                        # State management
│   │   └── app-store.ts              # Zustand global store
│   │
│   ├── types/                        # TypeScript definitions
│   │   └── index.ts                  # Shared types
│   │
│   ├── utils/                        # Utility functions
│   │   ├── cn.ts                     # Class name utility
│   │   └── rate-limit.ts             # Rate limiting logic
│   │
│   └── validators/                   # Input validation
│       └── index.ts                  # Zod schemas
│
├── public/                           # Static assets
│   ├── favicon.ico
│   └── images/
│
├── __tests__/                        # Test files
│   └── *.test.tsx
│
└── docs/                             # Documentation
    ├── ARCHITECTURE.md               # This file
    ├── API.md                        # API documentation
    ├── DEVELOPMENT.md                # Developer guide
    └── product-overview-pdr.md       # Product requirements
```

## Data Flow

### Meme Generation Flow

```
1. User Input
   │
   ├─→ User enters meme idea in textarea
   ├─→ Clicks "Generate" button
   └─→ Client validates input and API key

2. Prompt Analysis
   │
   ├─→ POST /api/analyze
   │   ├─→ Headers: Authorization Bearer {apiKey}
   │   ├─→ Body: { prompt }
   │   ├─→ Server calls Gemini API (gemini-2.0-flash-exp)
   │   ├─→ AI extracts keywords and generates captions
   │   └─→ Returns: { keywords: [], captionSets: [] }
   │
   └─→ Client updates progress: "Analyzing prompt..."

3. Template Search
   │
   ├─→ POST /api/templates
   │   ├─→ Body: { keywords }
   │   ├─→ Server calls Imgflip API
   │   ├─→ Filters templates by keywords
   │   └─→ Returns: { templates: [] }
   │
   └─→ Client updates progress: "Searching templates..."

4. Image Generation
   │
   ├─→ POST /api/generate
   │   ├─→ Headers: Authorization Bearer {apiKey}
   │   ├─→ Body: { templates, captions, prompt }
   │   ├─→ Server loops through templates (max 4)
   │   │   ├─→ Fetches template image
   │   │   ├─→ Calls Gemini API (gemini-2.5-flash-image-preview)
   │   │   ├─→ AI adds text to image
   │   │   └─→ Returns base64 image
   │   └─→ Returns: { memes: [] }
   │
   └─→ Client updates progress: "Generating memes..."

5. Display Results
   │
   ├─→ Store memes in Zustand state
   ├─→ Navigate to /results
   └─→ Display memes with download/share buttons
```

### State Flow Diagram

```
┌─────────────────────────────────────────────────┐
│           Zustand Store (app-store.ts)          │
├─────────────────────────────────────────────────┤
│  State:                                         │
│  - apiKey: string | null                        │
│  - generatedMemes: GeneratedMeme[]              │
│  - generationState: {                           │
│      isGenerating: boolean                      │
│      progress: number                           │
│      currentStep: string                        │
│    }                                            │
│                                                 │
│  Actions:                                       │
│  - setApiKey(key)                               │
│  - setGeneratedMemes(memes)                     │
│  - setGenerationState(state)                    │
│  - resetGenerationState()                       │
│                                                 │
│  Persistence:                                   │
│  - localStorage: apiKey only                    │
│  - Session: generatedMemes, generationState     │
└─────────────────────────────────────────────────┘
          │                    │
          │                    │
    ┌─────▼────────┐    ┌─────▼────────┐
    │   Settings   │    │     Home     │
    │     Page     │    │     Page     │
    └──────────────┘    └──────┬───────┘
                               │
                        ┌──────▼───────┐
                        │   Results    │
                        │     Page     │
                        └──────────────┘
```

## API Design

### Endpoint Specifications

#### POST /api/analyze
**Purpose**: Analyze user prompt and generate captions

**Request:**
```typescript
Headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer {apiKey}'
}

Body: {
  prompt: string
}
```

**Response:**
```typescript
{
  keywords: string[]        // 3-5 keywords for template search
  captions: Array<{         // 4 caption sets
    top: string
    bottom: string
  }>
}
```

**Error Responses:**
- `401`: Missing or invalid API key
- `429`: Rate limit exceeded
- `500`: Internal server error

---

#### POST /api/templates
**Purpose**: Search for meme templates

**Request:**
```typescript
Headers: {
  'Content-Type': 'application/json'
}

Body: {
  keywords: string[]
}
```

**Response:**
```typescript
{
  templates: Array<{
    id: string
    name: string
    url: string
    width: number
    height: number
    box_count: number
  }>
}
```

**Error Responses:**
- `400`: Invalid request data
- `500`: Template search failed

---

#### POST /api/generate
**Purpose**: Generate meme images with text overlays

**Request:**
```typescript
Headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer {apiKey}'
}

Body: {
  templates: MemeTemplate[]   // Max 4
  captions: CaptionSet[]      // Match templates length
  prompt: string              // Original user prompt
}
```

**Response:**
```typescript
{
  memes: Array<{
    id: string
    imageUrl: string          // Base64 data URL
    template: MemeTemplate
    captions: Array<{
      text: string
      box_index: number
    }>
  }>
}
```

**Error Responses:**
- `401`: Missing or invalid API key
- `429`: Rate limit exceeded
- `400`: Invalid request data
- `500`: Failed to generate memes

## State Management

### Zustand Store Structure

```typescript
interface AppState {
  // Persisted state (localStorage)
  apiKey: string | null

  // Session state
  generatedMemes: GeneratedMeme[]
  generationState: GenerationState

  // Actions
  setApiKey: (key: string) => void
  setGeneratedMemes: (memes: GeneratedMeme[]) => void
  setGenerationState: (state: Partial<GenerationState>) => void
  resetGenerationState: () => void
}
```

### State Persistence Strategy

- **localStorage**: API key only (encrypted)
- **sessionStorage**: Not used
- **In-memory**: Generated memes, generation state

**Why this strategy?**
- API key persists across sessions for convenience
- Memes are temporary and don't need long-term storage
- Reduces storage overhead
- Improves privacy (memes cleared on page refresh)

## Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────────────────────┐
│  Layer 1: Network Security                          │
│  - HTTPS/TLS encryption (enforced by Vercel)        │
│  - Automatic DDoS protection                        │
│  - WAF (Web Application Firewall)                   │
└─────────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────┐
│  Layer 2: Input Validation                          │
│  - Zod schema validation                            │
│  - Type checking with TypeScript                    │
│  - Sanitization of user input                       │
└─────────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────┐
│  Layer 3: API Security                              │
│  - API keys in Authorization headers                │
│  - Rate limiting (5 req/min per IP)                 │
│  - CORS protection                                  │
│  - No API key storage on server                     │
└─────────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────┐
│  Layer 4: Data Protection                           │
│  - API keys encrypted in localStorage               │
│  - No logging of sensitive data                     │
│  - In-memory-only processing                        │
│  - Automatic credential redaction in errors         │
└─────────────────────────────────────────────────────┘
```

### API Key Security

1. **Transmission**: Always via Authorization header, never in URL
2. **Storage**: Browser localStorage with encryption
3. **Server**: In-memory only during request lifecycle
4. **Logging**: Never logged, automatically redacted in errors
5. **Exposure**: Never exposed in client-side code or network responses

### Rate Limiting Implementation

```typescript
// lib/utils/rate-limit.ts
- In-memory cache of IP addresses and request timestamps
- Sliding window algorithm
- Default: 5 requests per 60 seconds per IP
- Returns 429 status when limit exceeded
- Automatic cleanup of old entries
```

## Performance Optimization

### Code Splitting

- Next.js automatic code splitting by route
- Dynamic imports for heavy components
- Route-based chunks minimize initial bundle size

### Image Optimization

- Next.js Image component for static images
- Lazy loading of generated memes
- Base64 data URLs for generated images (no additional requests)

### API Optimization

- Parallel API calls where possible (templates search doesn't require API key)
- Error handling prevents cascade failures
- Timeout handling (15 second max)
- Retry logic for transient failures

### Caching Strategy

- **Static assets**: Cached by Vercel CDN
- **API routes**: No caching (dynamic content)
- **Client-side**: React query cache (not yet implemented)
- **Template data**: Could be cached (future optimization)

### Bundle Size Optimization

```
Current bundle sizes:
- First Load JS: ~95 KB
- Main Page: ~15 KB
- Settings Page: ~8 KB
- Results Page: ~12 KB

Optimization techniques:
- Tree shaking (automatic)
- Code splitting (automatic)
- Dynamic imports (manual)
- Minimal dependencies
```

## Deployment Architecture

### Vercel Edge Functions

```
┌────────────────────────────────────────────────┐
│           Vercel Global Network                │
│  ┌──────────────────────────────────────────┐ │
│  │     Edge Locations (Worldwide)           │ │
│  │  - API Routes as Edge Functions          │ │
│  │  - Low latency (~50-100ms)               │ │
│  │  - Auto-scaling                          │ │
│  │  - Zero cold starts                      │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │     Static Assets (CDN)                  │ │
│  │  - HTML, CSS, JS                         │ │
│  │  - Images, fonts                         │ │
│  │  - Global cache                          │ │
│  └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

### Environment-Specific Configuration

- **Development**: `npm run dev` (local)
- **Preview**: Automatic preview deployments for PRs
- **Production**: Main branch auto-deploys to production

## Future Architecture Considerations

### Potential Improvements

1. **Database Layer**
   - Add PostgreSQL for user accounts
   - Store meme history
   - Analytics tracking

2. **Caching Layer**
   - Redis for template caching
   - Rate limit data persistence
   - Session management

3. **CDN for Generated Images**
   - Upload generated memes to S3/Cloudinary
   - Return URLs instead of base64
   - Reduce payload size

4. **WebSocket Support**
   - Real-time generation progress
   - Better UX for long operations

5. **Queue System**
   - Background job processing
   - Handle spike traffic
   - Retry failed generations

6. **Monitoring & Observability**
   - Error tracking (Sentry)
   - Performance monitoring (Vercel Analytics)
   - User analytics (PostHog)