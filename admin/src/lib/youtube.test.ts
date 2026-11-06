import { describe, expect, it } from 'vitest'

import { parseYouTubeUrl } from './youtube'

const embed = (id: string) => `https://www.youtube.com/embed/${id}`

describe('parseYouTubeUrl', () => {
  it.each([
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtube.com/watch?v=dQw4w9WgXcQ&t=10s',
    'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ?si=abc',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    'https://www.youtube.com/live/dQw4w9WgXcQ',
    '  https://youtu.be/dQw4w9WgXcQ  ',
  ])('normalises %s', (input) => {
    expect(parseYouTubeUrl(input)).toBe(embed('dQw4w9WgXcQ'))
  })

  it.each([
    '',
    'not a url',
    'https://vimeo.com/123456789',
    'https://youtube.com.evil.io/watch?v=dQw4w9WgXcQ',
    'https://evil.io/youtu.be/dQw4w9WgXcQ',
    'https://www.youtube.com/watch',
    'https://www.youtube.com/watch?v=short',
    'https://www.youtube.com/channel/UC1234567890',
    'javascript:alert(1)',
    'ftp://youtu.be/dQw4w9WgXcQ',
  ])('rejects %j', (input) => {
    expect(parseYouTubeUrl(input)).toBeNull()
  })
})
