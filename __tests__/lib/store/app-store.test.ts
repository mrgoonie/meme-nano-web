import { renderHook, act } from '@testing-library/react'
import { useAppStore } from '@/lib/store/app-store'

describe('useAppStore', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAppStore())

    expect(result.current.apiKey).toBeNull()
    expect(result.current.generatedMemes).toEqual([])
    expect(result.current.generationState).toEqual({
      isGenerating: false,
      progress: 0,
      currentStep: '',
    })
  })

  it('should set API key', () => {
    const { result } = renderHook(() => useAppStore())

    act(() => {
      result.current.setApiKey('test-api-key')
    })

    expect(result.current.apiKey).toBe('test-api-key')
  })

  it('should set generated memes', () => {
    const { result } = renderHook(() => useAppStore())

    const mockMemes = [
      {
        id: '1',
        imageUrl: 'https://example.com/meme1.jpg',
        template: {
          id: 't1',
          name: 'Test Template',
          url: 'https://example.com/template.jpg',
          width: 500,
          height: 500,
          box_count: 2,
        },
        captions: [
          { text: 'Top text', box_index: 0 },
          { text: 'Bottom text', box_index: 1 },
        ],
      },
    ]

    act(() => {
      result.current.setGeneratedMemes(mockMemes)
    })

    expect(result.current.generatedMemes).toEqual(mockMemes)
  })

  it('should update generation state', () => {
    const { result } = renderHook(() => useAppStore())

    act(() => {
      result.current.setGenerationState({
        isGenerating: true,
        progress: 50,
        currentStep: 'Generating memes...',
      })
    })

    expect(result.current.generationState).toEqual({
      isGenerating: true,
      progress: 50,
      currentStep: 'Generating memes...',
    })
  })

  it('should reset generation state', () => {
    const { result } = renderHook(() => useAppStore())

    act(() => {
      result.current.setGenerationState({
        isGenerating: true,
        progress: 50,
        currentStep: 'Generating memes...',
      })
    })

    act(() => {
      result.current.resetGenerationState()
    })

    expect(result.current.generationState).toEqual({
      isGenerating: false,
      progress: 0,
      currentStep: '',
    })
  })

  it('should persist API key in localStorage', () => {
    const { result } = renderHook(() => useAppStore())

    act(() => {
      result.current.setApiKey('test-api-key')
    })

    // Create a new store instance to check persistence
    const { result: result2 } = renderHook(() => useAppStore())

    expect(result2.current.apiKey).toBe('test-api-key')
  })
})