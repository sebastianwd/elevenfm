import Soundcloud from 'soundcloud.ts'

const soundcloudApi = new Soundcloud()

export const soundcloud = {
  getTrack: async (urlOrId: string) => {
    return await soundcloudApi.tracks.get(urlOrId)
  }
}
