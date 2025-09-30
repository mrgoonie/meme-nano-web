# MemeNano Development Guide

## Table of Contents
- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [Project Structure](#project-structure)
- [Code Style Guidelines](#code-style-guidelines)
- [Adding New Features](#adding-new-features)
- [Testing](#testing)
- [Debugging](#debugging)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)
- [Performance Optimization](#performance-optimization)

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** 18.17 or later
- **npm** 9+ or **pnpm** 8+ or **yarn** 1.22+
- **Git** 2.x
- A code editor (VS Code recommended)

### Recommended VS Code Extensions

- **ES7+ React/Redux/React-Native snippets** - Code snippets
- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **TypeScript and JavaScript Language Features** - Built-in TS support
- **ESLint** - Linting integration
- **Prettier** - Code formatting
- **Error Lens** - Inline error messages

### Initial Setup

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/meme-nano-web.git
cd meme-nano-web
```

2. **Install dependencies:**
```bash
npm install
# or
pnpm install
# or
yarn install
```

3. **Start development server:**
```bash
npm run dev
```

4. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

5. **Set up your API key:**
- Click the settings icon (gear) in the top-right
- Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- Paste your key and save

### Environment Configuration

Create a `.env.local` file if needed (optional for development):

```bash
# Optional: For server-side operations
GEMINI_API_KEY=your_key_here

# Optional: Custom configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note:** The app uses BYOK (Bring Your Own Key), so server-side API keys are not required for basic functionality.

## Development Environment

### Development Server

```bash
npm run dev
```

- Runs on `http://localhost:3000`
- Hot module replacement (HMR) enabled
- Automatic TypeScript type checking
- Fast refresh for React components

### Production Build

```bash
npm run build
npm run start
```

- Optimized production build
- Code minification
- Asset optimization
- Route pre-rendering

### Type Checking

```bash
npm run type-check
```

Runs TypeScript compiler without emitting files. Useful for CI/CD pipelines.

### Linting

```bash
npm run lint
```

Runs ESLint to check code quality. Auto-fixes many issues:

```bash
npm run lint -- --fix
```

## Project Structure

### Core Directories

```
meme-nano-web/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (serverless functions)
│   ├── home/              # Home page
│   ├── results/           # Results page
│   ├── settings/          # Settings page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Root page
│   └── globals.css        # Global styles
│
├── components/            # React components
│   ├── home/             # Home page components
│   ├── layout/           # Shared layout components
│   ├── results/          # Results page components
│   ├── settings/         # Settings page components
│   └── ui/               # Reusable UI components (shadcn/ui)
│
├── lib/                  # Core utilities
│   ├── api/             # External API integrations
│   ├── config/          # App configuration
│   ├── store/           # State management (Zustand)
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── validators/      # Input validation (Zod)
│
├── public/              # Static assets
├── __tests__/           # Test files
└── docs/                # Documentation
```

### Key Files

- `app/layout.tsx` - Root layout with metadata and providers
- `app/globals.css` - Global styles and Tailwind imports
- `tailwind.config.ts` - Tailwind CSS configuration
- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts

## Code Style Guidelines

### TypeScript

**Use explicit types for function parameters and return values:**

```typescript
// Good
function generateMeme(prompt: string): Promise<GeneratedMeme[]> {
  // ...
}

// Avoid
function generateMeme(prompt) {
  // ...
}
```

**Use interfaces for object shapes:**

```typescript
// Good
interface MemeTemplate {
  id: string
  name: string
  url: string
}

// Avoid
type MemeTemplate = {
  id: string
  name: string
  url: string
}
```

**Use type aliases for unions and primitives:**

```typescript
// Good
type Status = 'idle' | 'loading' | 'success' | 'error'
type ID = string | number

// Avoid
interface Status {
  value: 'idle' | 'loading' | 'success' | 'error'
}
```

### React Components

**Use functional components with TypeScript:**

```typescript
// Good
interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  )
}

// Avoid
export function Button(props) {
  return <button onClick={props.onClick}>{props.label}</button>
}
```

**Use descriptive component names:**

```typescript
// Good
export function MemeGenerationForm() { }
export function ResultsGrid() { }

// Avoid
export function Form() { }
export function Grid() { }
```

**Mark client components explicitly:**

```typescript
'use client'

import { useState } from 'react'

export function InteractiveComponent() {
  const [state, setState] = useState(0)
  // ...
}
```

### File Naming

- **Components**: PascalCase (`MemeCard.tsx`)
- **Utilities**: kebab-case (`rate-limit.ts`)
- **Hooks**: camelCase with `use` prefix (`useAppStore.ts`)
- **Types**: kebab-case (`index.ts` in `types/` folder)
- **API routes**: kebab-case (`route.ts`)

### Import Order

```typescript
// 1. React and Next.js
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// 2. External libraries
import { Button } from '@/components/ui/button'
import { create } from 'zustand'

// 3. Internal utilities
import { useAppStore } from '@/lib/store/app-store'
import type { MemeTemplate } from '@/lib/types'

// 4. Relative imports
import { MemeCard } from './MemeCard'
import styles from './styles.module.css'
```

### Tailwind CSS

**Use Tailwind utility classes:**

```tsx
// Good
<div className="flex items-center justify-between p-4 rounded-lg">

// Avoid custom CSS unless necessary
<div className="custom-container">
```

**Use the `cn()` utility for conditional classes:**

```tsx
import { cn } from '@/lib/utils/cn'

<button className={cn(
  "px-4 py-2 rounded",
  isActive && "bg-blue-500",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
```

**Follow responsive design patterns:**

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

### Error Handling

**Always handle errors gracefully:**

```typescript
// Good
try {
  const response = await fetch('/api/generate', options)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to generate')
  }

  const data = await response.json()
  return data
} catch (error) {
  console.error('Generation failed:', error)
  showErrorToUser(error instanceof Error ? error.message : 'Unknown error')
}

// Avoid
const response = await fetch('/api/generate', options)
const data = await response.json()
return data
```

**Use type guards:**

```typescript
function isError(value: unknown): value is Error {
  return value instanceof Error
}

if (isError(error)) {
  console.error(error.message)
}
```

### Validation

**Use Zod for input validation:**

```typescript
import { z } from 'zod'

const promptSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(1000)
})

const result = promptSchema.safeParse(data)

if (!result.success) {
  return { error: result.error.flatten() }
}
```

## Adding New Features

### Step-by-Step Guide

#### 1. Plan Your Feature

- Define the feature requirements
- Sketch UI mockups if needed
- Identify affected components and APIs
- Consider edge cases and error handling

#### 2. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

#### 3. Implement the Feature

**Example: Adding a "Favorite Memes" feature**

**Step 1: Define types**

```typescript
// lib/types/index.ts
export interface FavoriteMeme extends GeneratedMeme {
  favoritedAt: number
}

export interface AppState {
  // ... existing state
  favoriteMemes: FavoriteMeme[]
  addFavorite: (meme: GeneratedMeme) => void
  removeFavorite: (id: string) => void
}
```

**Step 2: Update store**

```typescript
// lib/store/app-store.ts
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // ... existing state
      favoriteMemes: [],

      addFavorite: (meme) => {
        set((state) => ({
          favoriteMemes: [
            ...state.favoriteMemes,
            { ...meme, favoritedAt: Date.now() }
          ]
        }))
      },

      removeFavorite: (id) => {
        set((state) => ({
          favoriteMemes: state.favoriteMemes.filter(m => m.id !== id)
        }))
      }
    }),
    {
      name: STORAGE_KEYS.APP_STATE,
      partialize: (state) => ({
        apiKey: state.apiKey,
        favoriteMemes: state.favoriteMemes
      })
    }
  )
)
```

**Step 3: Create UI component**

```tsx
// components/results/FavoriteButton.tsx
'use client'

import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store/app-store'
import type { GeneratedMeme } from '@/lib/types'

interface FavoriteButtonProps {
  meme: GeneratedMeme
}

export function FavoriteButton({ meme }: FavoriteButtonProps) {
  const { favoriteMemes, addFavorite, removeFavorite } = useAppStore()
  const isFavorited = favoriteMemes.some(m => m.id === meme.id)

  const handleToggle = () => {
    if (isFavorited) {
      removeFavorite(meme.id)
    } else {
      addFavorite(meme)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={isFavorited ? 'fill-red-500 text-red-500' : ''}
      />
    </Button>
  )
}
```

**Step 4: Integrate into page**

```tsx
// app/results/page.tsx
import { FavoriteButton } from '@/components/results/FavoriteButton'

export default function ResultsPage() {
  // ...
  return (
    <div>
      {memes.map(meme => (
        <div key={meme.id}>
          <img src={meme.imageUrl} alt="Meme" />
          <FavoriteButton meme={meme} />
        </div>
      ))}
    </div>
  )
}
```

#### 4. Write Tests

```typescript
// __tests__/favorite-button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { FavoriteButton } from '@/components/results/FavoriteButton'

describe('FavoriteButton', () => {
  it('toggles favorite status', () => {
    const meme = { id: '1', imageUrl: 'test.jpg', /* ... */ }
    render(<FavoriteButton meme={meme} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(button).toHaveAttribute('aria-label', 'Remove from favorites')
  })
})
```

#### 5. Update Documentation

- Add feature to README.md
- Update DEVELOPMENT.md if needed
- Add API documentation if applicable

#### 6. Submit Pull Request

```bash
git add .
git commit -m "feat: add favorite memes functionality"
git push origin feature/your-feature-name
```

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Watch mode (re-run on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Writing Tests

**Component tests:**

```typescript
// __tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders with label', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)
    expect(screen.getByText('Click me')).toBeDisabled()
  })
})
```

**API route tests:**

```typescript
// __tests__/api/analyze.test.ts
import { POST } from '@/app/api/analyze/route'
import { NextRequest } from 'next/server'

describe('/api/analyze', () => {
  it('returns 401 without API key', async () => {
    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test' })
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })
})
```

**Utility function tests:**

```typescript
// __tests__/utils/cn.test.ts
import { cn } from '@/lib/utils/cn'

describe('cn utility', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })
})
```

## Debugging

### Browser DevTools

**Console logging:**

```typescript
console.log('Debug info:', data)
console.error('Error:', error)
console.warn('Warning:', warning)
```

**React DevTools:**

- Install React Developer Tools extension
- Inspect component props and state
- View component hierarchy

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### Network Debugging

**Check API requests in Network tab:**

1. Open DevTools > Network
2. Filter by "Fetch/XHR"
3. Inspect request/response headers and payloads

**Use network throttling:**

- Simulate slow connections
- Test loading states
- Verify timeout handling

### State Debugging

**Zustand DevTools:**

```typescript
import { devtools } from 'zustand/middleware'

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({ /* ... */ }),
      { name: 'app-store' }
    ),
    { name: 'AppStore' }
  )
)
```

Install Redux DevTools extension to inspect Zustand state.

## Common Tasks

### Adding a New Page

1. Create page file:
```bash
mkdir -p app/new-page
touch app/new-page/page.tsx
```

2. Implement page:
```tsx
// app/new-page/page.tsx
export default function NewPage() {
  return (
    <div>
      <h1>New Page</h1>
    </div>
  )
}
```

3. Add navigation:
```tsx
<Link href="/new-page">Go to New Page</Link>
```

### Adding a New API Route

1. Create route file:
```bash
mkdir -p app/api/new-endpoint
touch app/api/new-endpoint/route.ts
```

2. Implement handler:
```typescript
// app/api/new-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Process request
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
```

### Adding a New UI Component

1. Create component file:
```bash
touch components/ui/new-component.tsx
```

2. Implement component:
```tsx
// components/ui/new-component.tsx
interface NewComponentProps {
  // Define props
}

export function NewComponent({ ...props }: NewComponentProps) {
  return (
    <div>
      {/* Component content */}
    </div>
  )
}
```

3. Export from index (optional):
```typescript
// components/ui/index.ts
export { NewComponent } from './new-component'
```

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update all dependencies
npm update

# Update specific package
npm update package-name

# Update to latest (including breaking changes)
npm install package-name@latest
```

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or use different port
PORT=3001 npm run dev
```

#### TypeScript Errors

```bash
# Clear TypeScript cache
rm -rf .next
rm tsconfig.tsbuildinfo

# Rebuild
npm run build
```

#### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Hot Reload Not Working

```bash
# Restart dev server
# Ctrl+C to stop
npm run dev
```

#### API Route Changes Not Reflecting

```bash
# Restart dev server (API routes aren't hot-reloaded)
npm run dev
```

### Performance Issues

**Slow build times:**

```bash
# Use SWC compiler (default in Next.js 15)
# Clear build cache
rm -rf .next

# Reduce bundle size
npm run build -- --profile
```

**Slow page loads:**

- Check Network tab for large assets
- Optimize images
- Implement code splitting
- Use dynamic imports

## Performance Optimization

### Bundle Analysis

```bash
# Analyze bundle size
npm run build

# Use bundle analyzer (add to next.config.ts)
npm install @next/bundle-analyzer
```

### Image Optimization

```tsx
import Image from 'next/image'

// Use Next.js Image component
<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
  loading="lazy"
/>
```

### Code Splitting

```tsx
import dynamic from 'next/dynamic'

// Dynamic import for heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>
})
```

### Memoization

```tsx
import { useMemo, useCallback } from 'react'

// Memoize expensive calculations
const result = useMemo(() => expensiveCalculation(data), [data])

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething()
}, [])
```

### API Response Optimization

```typescript
// Reduce payload size
const meme = {
  id: meme.id,
  imageUrl: meme.imageUrl,
  // Only include necessary fields
}

// Use compression
// Vercel automatically compresses responses
```

---

For more information, see:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [API.md](./API.md) - API documentation
- [README.md](../README.md) - Project overview