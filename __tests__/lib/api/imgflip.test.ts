import { searchMemeTemplates } from '@/lib/api/imgflip'

// Mock fetch
global.fetch = jest.fn()

describe('searchMemeTemplates', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch and filter meme templates by keywords', async () => {
    const mockResponse = {
      success: true,
      data: {
        memes: [
          {
            id: '1',
            name: 'Drake Hotline Bling',
            url: 'https://i.imgflip.com/1.jpg',
            width: 500,
            height: 500,
            box_count: 2,
          },
          {
            id: '2',
            name: 'Distracted Boyfriend',
            url: 'https://i.imgflip.com/2.jpg',
            width: 500,
            height: 500,
            box_count: 3,
          },
          {
            id: '3',
            name: 'Two Buttons',
            url: 'https://i.imgflip.com/3.jpg',
            width: 500,
            height: 500,
            box_count: 3,
          },
        ],
      },
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const result = await searchMemeTemplates(['drake'])

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Drake Hotline Bling')
  })

  it('should return top memes if no matches found', async () => {
    const mockResponse = {
      success: true,
      data: {
        memes: Array.from({ length: 15 }, (_, i) => ({
          id: `${i + 1}`,
          name: `Meme ${i + 1}`,
          url: `https://i.imgflip.com/${i + 1}.jpg`,
          width: 500,
          height: 500,
          box_count: 2,
        })),
      },
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const result = await searchMemeTemplates(['nonexistent'])

    expect(result).toHaveLength(10)
  })

  it('should throw error if fetch fails', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    })

    await expect(searchMemeTemplates(['drake'])).rejects.toThrow(
      'Failed to fetch meme templates'
    )
  })
})