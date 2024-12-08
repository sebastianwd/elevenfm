export type SearchArtist = {
  artists: Array<{
    idArtist: string
    strArtist: string
    strArtistStripped: string
    strArtistAlternate: string
    strLabel: string
    idLabel: string
    intFormedYear: number
    intBornYear: number
    intDiedYear: number
    strDisbanded: string
    strStyle: string
    strGenre: string
    strMood: string
    strWebsite: string
    strFacebook: string
    strTwitter: string
    strBiographyEN: string
    strBiographyDE: string
    strBiographyFR: string
    strBiographyCN: string
    strBiographyIT: string
    strBiographyJP: string
    strBiographyRU: string
    strBiographyES: string
    strBiographyPT: string
    strBiographySE: string
    strBiographyNL: string
    strBiographyHU: string
    strBiographyNO: string
    strBiographyIL: string
    strBiographyPL: string
    strGender: string
    intMembers: number
    strCountry: string
    strCountryCode: string
    strArtistThumb: string
    strArtistLogo: string
    strArtistCutout: string
    strArtistClearart: string
    strArtistWideThumb: string
    strArtistFanart: string
    strArtistFanart2: string
    strArtistFanart3: string
    strArtistFanart4: string
    strArtistBanner: string
    strMusicBrainzID: string
    strISNIcode: string
    strLastFMChart: string
    intCharted: number
    strLocked: string
  }>
}

export type SearchAlbums = {
  album: Array<{
    idAlbum: string
    idArtist: string
    idLabel?: string
    strAlbum: string
    strAlbumStripped: string
    strArtist: string
    strArtistStripped: string
    intYearReleased: number
    strStyle?: string
    strGenre?: string
    strLabel?: string
    strReleaseFormat: string
    intSales?: number
    strAlbumThumb: string
    strAlbumThumbHQ: string
    strAlbumThumbBack: string
    strAlbumCDart?: string
    strAlbumSpine: string
    strAlbum3DCase: string
    strAlbum3DFlat: string
    strAlbum3DFace: string
    strAlbum3DThumb: string
    strDescription: string
    strDescriptionDE: string
    strDescriptionFR: string
    strDescriptionCN: string
    strDescriptionIT: string
    strDescriptionJP: string
    strDescriptionRU: string
    strDescriptionES: string
    strDescriptionPT: string
    strDescriptionSE: string
    strDescriptionNL: string
    strDescriptionHU: string
    strDescriptionNO: string
    strDescriptionIL: string
    strDescriptionPL: string
    intLoved: number
    intScore?: number
    intScoreVotes?: number
    strReview?: string
    strMood?: string
    strTheme?: string
    strSpeed?: string
    strLocation: string
    strMusicBrainzID: string
    strMusicBrainzArtistID: string
    strAllMusicID: string
    strBBCReviewID: string
    strRateYourMusicID: string
    strDiscogsID?: string
    strWikidataID?: string
    strWikipediaID?: string
    strGeniusID: string
    strLyricWikiID: string
    strMusicMozID: string
    strItunesID: string
    strAmazonID: string
    strLocked: string
    strDescriptionEN?: string
  }>
}

export type AlbumTracks = {
  track: Array<{
    idTrack: string
    idAlbum: string
    idArtist: string
    idLyric: string | null
    idIMVDB: string | null
    strTrack: string
    strAlbum: string
    strArtist: string
    strArtistAlternate: string | null
    intCD: string | null
    intDuration: string
    strGenre: string | null
    strMood: string | null
    strStyle: string | null
    strTheme: string | null
    strDescriptionEN: string | null
    strDescriptionDE: string | null
    strDescriptionFR: string | null
    strDescriptionCN: string | null
    strDescriptionIT: string | null
    strDescriptionJP: string | null
    strDescriptionRU: string | null
    strDescriptionES: string | null
    strDescriptionPT: string | null
    strDescriptionSE: string | null
    strDescriptionNL: string | null
    strDescriptionHU: string | null
    strDescriptionNO: string | null
    strDescriptionIL: string | null
    strDescriptionPL: string | null
    strTrackThumb: string | null
    strTrack3DCase: string | null
    strTrackLyrics: string | null
    strMusicVid: string | null
    strMusicVidDirector: string | null
    strMusicVidCompany: string | null
    strMusicVidScreen1: string | null
    strMusicVidScreen2: string | null
    strMusicVidScreen3: string | null
    intMusicVidViews: string | null
    intMusicVidLikes: string | null
    intMusicVidDislikes: string | null
    intMusicVidFavorites: string | null
    intMusicVidComments: string | null
    intTrackNumber: string
    intLoved: string
    intScore: string | null
    intScoreVotes: string | null
    intTotalListeners: string | null
    intTotalPlays: string | null
    strMusicBrainzID: string
    strMusicBrainzAlbumID: string
    strMusicBrainzArtistID: string
    strLocked: string
  }>
}
