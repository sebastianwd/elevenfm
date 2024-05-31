import { ytGetId } from '../get-yt-url-id'

describe('ytGetId', () => {
  it('should return the playlist ID if the URL contains a playlist', () => {
    const url =
      'https://www.youtube.com/watch?v=VIDEO_ID&list=PLAYLIST_ID&index=1'
    const result = ytGetId(url)
    expect(result).toBe('PLAYLIST_ID')
  })

  it('should return the video ID if the URL contains a video', () => {
    const url = 'https://www.youtube.com/watch?v=3B3l5pfPN0I'
    const result = ytGetId(url)
    expect(result).toBe('3B3l5pfPN0I')
  })

  it('should return an empty string if the URL does not contain a playlist or video', () => {
    const url = 'https://www.youtube.com'
    const result = ytGetId(url)
    expect(result).toBe('')
  })

  it('should handle URLs with different formats', () => {
    const url1 = 'https://youtu.be/3B3l5pfPN0I'
    const url2 = 'https://www.youtube.com/embed/3B3l5pfPN0I'
    const url3 = 'https://www.youtube.com/shorts/3B3l5pfPN0I'
    const result1 = ytGetId(url1)
    const result2 = ytGetId(url2)
    const result3 = ytGetId(url3)
    expect(result1).toBe('3B3l5pfPN0I')
    expect(result2).toBe('3B3l5pfPN0I')
    expect(result3).toBe('3B3l5pfPN0I')
  })
})
