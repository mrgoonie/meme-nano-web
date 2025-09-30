# MemeNano API Documentation

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [Rate Limits](#rate-limits)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [POST /api/analyze](#post-apianalyze)
  - [POST /api/templates](#post-apitemplates)
  - [POST /api/generate](#post-apigenerate)
- [Type Definitions](#type-definitions)
- [Examples](#examples)

## Overview

MemeNano provides three REST API endpoints for meme generation. All endpoints are serverless functions deployed as Vercel Edge Functions.

**Base URL**: `https://your-domain.vercel.app` (or `http://localhost:3000` for development)

**Content Type**: All requests and responses use `application/json`

**Security**: All communications are encrypted via HTTPS/TLS

## Authentication

MemeNano uses a BYOK (Bring Your Own Key) model. Users provide their own Gemini API keys which are passed to endpoints requiring AI processing.

### Authentication Method

API key must be sent in the `Authorization` header using Bearer token format:

```
Authorization: Bearer YOUR_GEMINI_API_KEY
```

### Which Endpoints Require Authentication?

- `/api/analyze` - **Requires authentication** (uses Gemini API)
- `/api/templates` - **No authentication** (uses public Imgflip API)
- `/api/generate` - **Requires authentication** (uses Gemini API)

### Security Notes

- API keys are transmitted over HTTPS only
- Keys are never stored on the server
- Keys are used in-memory only during request processing
- Keys are automatically redacted from error logs
- Never include API keys in URL parameters

## Rate Limits

All endpoints implement rate limiting to prevent abuse.

### Rate Limit Details

- **Limit**: 5 requests per minute per IP address
- **Algorithm**: Sliding window
- **Headers**: Rate limit information is not currently exposed in response headers
- **Reset**: Automatic after 60 seconds

### Rate Limit Response

When rate limit is exceeded:

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "error": "Rate limit exceeded. Please try again later."
}
```

### Best Practices

- Implement exponential backoff on 429 errors
- Cache template search results when possible
- Batch operations where applicable
- Display user-friendly messages on rate limit errors

## Error Handling

### Standard Error Response Format

```typescript
{
  error: string  // Human-readable error message
}
```

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Invalid request data or missing required fields |
| 401 | Unauthorized | Missing, invalid, or expired API key |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error, external API failure |

### Error Messages

Common error messages you may encounter:

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Missing or invalid API key" | No Authorization header or malformed token | Include valid API key in Authorization header |
| "Invalid API key" | Gemini API rejected the key | Verify API key is correct and active |
| "Rate limit exceeded. Please try again later." | Too many requests | Wait 60 seconds before retrying |
| "Invalid request data" | Missing or malformed request body | Check request format matches documentation |
| "Failed to generate memes" | Image generation failed | Retry request, check API key quota |
| "Failed to fetch templates" | Imgflip API unavailable | Retry request after a short delay |

### Error Handling Best Practices

```typescript
try {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({ prompt })
  })

  if (!response.ok) {
    const error = await response.json()

    // Handle specific status codes
    if (response.status === 401) {
      // Invalid API key
      showError('Please check your API key in Settings')
    } else if (response.status === 429) {
      // Rate limit
      showError('Too many requests. Please wait a moment.')
    } else {
      // Generic error
      showError(error.error || 'Something went wrong')
    }
    return
  }

  const data = await response.json()
  // Process success response
} catch (err) {
  // Network error
  showError('Network error. Please check your connection.')
}
```

## Endpoints

### POST /api/analyze

Analyzes a user's meme idea and generates keywords for template search and caption sets for meme creation.

#### Request

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer YOUR_GEMINI_API_KEY
```

**Body:**
```typescript
{
  prompt: string  // User's meme idea (required, non-empty)
}
```

**Example:**
```json
{
  "prompt": "When you deploy code to production on Friday afternoon"
}
```

#### Response

**Success (200 OK):**
```typescript
{
  keywords: string[]      // 3-5 keywords for template search
  captions: Array<{       // 4 caption sets
    top: string           // Top text for meme
    bottom: string        // Bottom text for meme
  }>
}
```

**Example:**
```json
{
  "keywords": ["disaster", "mistake", "regret", "panic", "weekend"],
  "captions": [
    {
      "top": "DEPLOYS TO PRODUCTION",
      "bottom": "ON FRIDAY AT 4:59 PM"
    },
    {
      "top": "IT'S FRIDAY 5PM",
      "bottom": "PERFECT TIME TO PUSH TO PROD"
    },
    {
      "top": "PRODUCTION IS DOWN",
      "bottom": "AND IT'S THE WEEKEND"
    },
    {
      "top": "WHO DEPLOYS ON FRIDAY?",
      "bottom": "THIS GUY"
    }
  ]
}
```

#### Error Responses

**401 Unauthorized:**
```json
{
  "error": "Missing or invalid API key"
}
```

**400 Bad Request:**
```json
{
  "error": "Prompt is required"
}
```

**429 Too Many Requests:**
```json
{
  "error": "Rate limit exceeded. Please try again later."
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to analyze prompt"
}
```

---

### POST /api/templates

Searches for meme templates based on keywords. Uses the Imgflip API to find matching templates.

#### Request

**Headers:**
```http
Content-Type: application/json
```

**Body:**
```typescript
{
  keywords: string[]  // Array of search keywords (required)
}
```

**Example:**
```json
{
  "keywords": ["disaster", "panic", "regret"]
}
```

#### Response

**Success (200 OK):**
```typescript
{
  templates: Array<{
    id: string          // Unique template ID
    name: string        // Template name
    url: string         // Template image URL
    width: number       // Image width in pixels
    height: number      // Image height in pixels
    box_count: number   // Number of text boxes
  }>
}
```

**Example:**
```json
{
  "templates": [
    {
      "id": "61579",
      "name": "One Does Not Simply",
      "url": "https://i.imgflip.com/1bij.jpg",
      "width": 568,
      "height": 335,
      "box_count": 2
    },
    {
      "id": "563423",
      "name": "That Would Be Great",
      "url": "https://i.imgflip.com/c2qn.jpg",
      "width": 526,
      "height": 440,
      "box_count": 2
    }
  ]
}
```

#### Error Responses

**400 Bad Request:**
```json
{
  "error": "Keywords are required"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to fetch templates"
}
```

#### Notes

- Returns up to 10 templates
- If no templates match keywords, returns top 10 popular templates
- Templates are filtered by keyword matching in template names
- No authentication required (uses public Imgflip API)

---

### POST /api/generate

Generates meme images by adding text overlays to templates using AI image generation.

#### Request

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer YOUR_GEMINI_API_KEY
```

**Body:**
```typescript
{
  templates: MemeTemplate[]   // Array of templates (max 4)
  captions: Array<{           // Array of caption sets (matches templates)
    top: string
    bottom: string
  }>
  prompt: string              // Original user prompt
}
```

**Example:**
```json
{
  "templates": [
    {
      "id": "61579",
      "name": "One Does Not Simply",
      "url": "https://i.imgflip.com/1bij.jpg",
      "width": 568,
      "height": 335,
      "box_count": 2
    }
  ],
  "captions": [
    {
      "top": "ONE DOES NOT SIMPLY",
      "bottom": "DEPLOY ON FRIDAY"
    }
  ],
  "prompt": "When you deploy code to production on Friday afternoon"
}
```

#### Response

**Success (200 OK):**
```typescript
{
  memes: Array<{
    id: string              // Unique meme ID
    imageUrl: string        // Base64 data URL (data:image/jpeg;base64,...)
    template: MemeTemplate  // Original template used
    captions: Array<{       // Captions applied
      text: string
      box_index: number
    }>
  }>
}
```

**Example:**
```json
{
  "memes": [
    {
      "id": "61579-1234567890-0",
      "imageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "template": {
        "id": "61579",
        "name": "One Does Not Simply",
        "url": "https://i.imgflip.com/1bij.jpg",
        "width": 568,
        "height": 335,
        "box_count": 2
      },
      "captions": [
        {
          "text": "ONE DOES NOT SIMPLY",
          "box_index": 0
        },
        {
          "text": "DEPLOY ON FRIDAY",
          "box_index": 1
        }
      ]
    }
  ]
}
```

#### Error Responses

**401 Unauthorized:**
```json
{
  "error": "Missing or invalid API key"
}
```

**400 Bad Request:**
```json
{
  "error": "Invalid request data"
}
```

**429 Too Many Requests:**
```json
{
  "error": "Rate limit exceeded. Please try again later."
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to generate memes"
}
```

#### Notes

- Maximum of 4 memes generated per request
- Generation takes 5-15 seconds per meme
- If any meme fails, others may still succeed
- Returns error only if all memes fail to generate
- Base64 images can be large (500KB - 2MB per meme)

## Type Definitions

### MemeTemplate
```typescript
interface MemeTemplate {
  id: string          // Unique identifier from Imgflip
  name: string        // Human-readable template name
  url: string         // Direct URL to template image
  width: number       // Image width in pixels
  height: number      // Image height in pixels
  box_count: number   // Number of text areas (typically 2)
}
```

### CaptionSet
```typescript
interface CaptionSet {
  top: string       // Text for top of meme
  bottom: string    // Text for bottom of meme
}
```

### MemeCaption
```typescript
interface MemeCaption {
  text: string        // Caption text
  box_index: number   // Position index (0 = top, 1 = bottom)
}
```

### GeneratedMeme
```typescript
interface GeneratedMeme {
  id: string              // Unique identifier for generated meme
  imageUrl: string        // Base64 data URL of generated image
  template: MemeTemplate  // Original template used
  captions: MemeCaption[] // Applied captions
}
```

## Examples

### Complete Meme Generation Flow

#### 1. Analyze Prompt

```typescript
const analyzeResponse = await fetch('/api/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    prompt: 'When you finally fix a bug'
  })
})

const { keywords, captions } = await analyzeResponse.json()
// keywords: ["success", "victory", "relief", "celebration"]
// captions: [{ top: "...", bottom: "..." }, ...]
```

#### 2. Search Templates

```typescript
const templatesResponse = await fetch('/api/templates', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    keywords: keywords
  })
})

const { templates } = await templatesResponse.json()
// templates: [{ id, name, url, ... }, ...]
```

#### 3. Generate Memes

```typescript
const generateResponse = await fetch('/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    templates: templates.slice(0, 4),
    captions: captions,
    prompt: 'When you finally fix a bug'
  })
})

const { memes } = await generateResponse.json()
// memes: [{ id, imageUrl, template, captions }, ...]
```

#### 4. Display Memes

```typescript
memes.forEach(meme => {
  const img = document.createElement('img')
  img.src = meme.imageUrl
  img.alt = `Meme: ${meme.template.name}`
  document.body.appendChild(img)
})
```

### Error Handling Example

```typescript
async function generateMemes(apiKey: string, prompt: string) {
  try {
    // Step 1: Analyze
    const analyzeRes = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ prompt })
    })

    if (analyzeRes.status === 401) {
      throw new Error('Invalid API key')
    }
    if (analyzeRes.status === 429) {
      throw new Error('Rate limit exceeded')
    }
    if (!analyzeRes.ok) {
      throw new Error('Failed to analyze prompt')
    }

    const { keywords, captions } = await analyzeRes.json()

    // Step 2: Templates
    const templatesRes = await fetch('/api/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ keywords })
    })

    if (!templatesRes.ok) {
      throw new Error('Failed to fetch templates')
    }

    const { templates } = await templatesRes.json()

    // Step 3: Generate
    const generateRes = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        templates: templates.slice(0, 4),
        captions,
        prompt
      })
    })

    if (!generateRes.ok) {
      const error = await generateRes.json()
      throw new Error(error.error || 'Failed to generate memes')
    }

    const { memes } = await generateRes.json()
    return memes

  } catch (error) {
    console.error('Meme generation failed:', error)
    throw error
  }
}
```

### Rate Limit Handling with Retry

```typescript
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options)

    if (response.status === 429) {
      // Rate limited, wait and retry
      const waitTime = Math.pow(2, i) * 1000 // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, waitTime))
      continue
    }

    return response
  }

  throw new Error('Max retries exceeded')
}
```

## Postman Collection

A Postman collection is available for testing the API:

```json
{
  "info": {
    "name": "MemeNano API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Analyze Prompt",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{GEMINI_API_KEY}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"prompt\": \"When you deploy on Friday\"\n}"
        },
        "url": "{{BASE_URL}}/api/analyze"
      }
    },
    {
      "name": "Search Templates",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"keywords\": [\"disaster\", \"panic\"]\n}"
        },
        "url": "{{BASE_URL}}/api/templates"
      }
    },
    {
      "name": "Generate Memes",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{GEMINI_API_KEY}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"templates\": [...],\n  \"captions\": [...],\n  \"prompt\": \"...\"\n}"
        },
        "url": "{{BASE_URL}}/api/generate"
      }
    }
  ],
  "variable": [
    {
      "key": "BASE_URL",
      "value": "http://localhost:3000"
    },
    {
      "key": "GEMINI_API_KEY",
      "value": "your_api_key_here"
    }
  ]
}
```