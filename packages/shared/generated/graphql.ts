import type { DocumentNode } from "graphql/language/ast";
import type { GraphQLClient, RequestOptions } from "graphql-request";
import gql from "graphql-tag";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
type GraphQLClientRequestHeaders = RequestOptions["requestHeaders"];
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

export type Mutation = {
  __typename?: "Mutation";
  addToPlaylist: Scalars["Boolean"]["output"];
  createPlaylist: Playlist;
  createSongRadio: Playlist;
  deletePlaylist: Scalars["Boolean"]["output"];
  importPlaylist: Playlist;
  removeFromPlaylist: Scalars["Boolean"]["output"];
  updatePlaylist: Playlist;
  updatePlaylistSongRank: Scalars["Boolean"]["output"];
  updateUser: UpdateUserOutput;
};

export type MutationAddToPlaylistArgs = {
  playlistId: Scalars["ID"]["input"];
  songIds: InputMaybe<Array<Scalars["ID"]["input"]>>;
  songs: InputMaybe<Array<SongInput>>;
};

export type MutationCreatePlaylistArgs = {
  name: InputMaybe<Scalars["String"]["input"]>;
};

export type MutationCreateSongRadioArgs = {
  songArtist: InputMaybe<Scalars["String"]["input"]>;
  songId: InputMaybe<Scalars["ID"]["input"]>;
  songTitle: InputMaybe<Scalars["String"]["input"]>;
};

export type MutationDeletePlaylistArgs = {
  playlistId: Scalars["ID"]["input"];
};

export type MutationImportPlaylistArgs = {
  playlistId: InputMaybe<Scalars["ID"]["input"]>;
  url: Scalars["String"]["input"];
};

export type MutationRemoveFromPlaylistArgs = {
  playlistId: Scalars["ID"]["input"];
  songId: Scalars["ID"]["input"];
};

export type MutationUpdatePlaylistArgs = {
  name: Scalars["String"]["input"];
  playlistId: Scalars["ID"]["input"];
};

export type MutationUpdatePlaylistSongRankArgs = {
  playlistId: Scalars["ID"]["input"];
  rank: Scalars["String"]["input"];
  songId: Scalars["ID"]["input"];
};

export type MutationUpdateUserArgs = {
  user: UserInput;
};

export type Query = {
  __typename?: "Query";
  artist: Artist;
  getAlbumBySong: SongAlbum;
  getAlbums: Maybe<Array<Album>>;
  getLyrics: SongLyrics;
  getVideoInfo: Array<SongVideo>;
  me: User;
  playlist: Playlist;
  searchArtists: Array<Scalars["String"]["output"]>;
  similarArtists: Array<Artist>;
  topsongsByArtist: Array<Song>;
  userPlaylists: Array<Playlist>;
};

export type QueryArtistArgs = {
  name: Scalars["String"]["input"];
};

export type QueryGetAlbumBySongArgs = {
  artist: Scalars["String"]["input"];
  song: Scalars["String"]["input"];
};

export type QueryGetAlbumsArgs = {
  artist: Scalars["String"]["input"];
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  page: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryGetLyricsArgs = {
  artist: Scalars["String"]["input"];
  song: Scalars["String"]["input"];
};

export type QueryGetVideoInfoArgs = {
  query: Scalars["String"]["input"];
};

export type QueryPlaylistArgs = {
  playlistId: Scalars["ID"]["input"];
};

export type QuerySearchArtistsArgs = {
  artist: Scalars["String"]["input"];
  limit?: Scalars["Int"]["input"];
};

export type QuerySimilarArtistsArgs = {
  artist: Scalars["String"]["input"];
  limit?: Scalars["Int"]["input"];
  onlyNames?: Scalars["Boolean"]["input"];
};

export type QueryTopsongsByArtistArgs = {
  artist: Scalars["String"]["input"];
  limit?: Scalars["Int"]["input"];
  page: InputMaybe<Scalars["Int"]["input"]>;
};

export type Account = {
  __typename?: "account";
  provider: Scalars["String"]["output"];
};

export type Album = {
  __typename?: "album";
  artist: Scalars["String"]["output"];
  coverImage: Maybe<Scalars["String"]["output"]>;
  description: Maybe<Scalars["String"]["output"]>;
  genre: Maybe<Scalars["String"]["output"]>;
  name: Scalars["String"]["output"];
  tracks: Maybe<Array<Scalars["String"]["output"]>>;
  year: Maybe<Scalars["String"]["output"]>;
};

export type Artist = {
  __typename?: "artist";
  bannerImage: Maybe<Scalars["String"]["output"]>;
  biography: Maybe<Scalars["String"]["output"]>;
  disbanded: Maybe<Scalars["Boolean"]["output"]>;
  disbandedYear: Maybe<Scalars["String"]["output"]>;
  facebook: Maybe<Scalars["String"]["output"]>;
  formedYear: Maybe<Scalars["String"]["output"]>;
  genre: Maybe<Scalars["String"]["output"]>;
  image: Maybe<Scalars["String"]["output"]>;
  location: Maybe<Scalars["String"]["output"]>;
  logo: Maybe<Scalars["String"]["output"]>;
  memberQuantity: Maybe<Scalars["Float"]["output"]>;
  name: Scalars["String"]["output"];
  style: Maybe<Scalars["String"]["output"]>;
  twitter: Maybe<Scalars["String"]["output"]>;
  website: Maybe<Scalars["String"]["output"]>;
};

export type Playlist = {
  __typename?: "playlist";
  createdAt: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  songs: Maybe<Array<UserSong>>;
  type: Maybe<Scalars["Int"]["output"]>;
  user: Maybe<User>;
};

export type Song = {
  __typename?: "song";
  album: Maybe<Scalars["String"]["output"]>;
  artist: Scalars["String"]["output"];
  duration: Maybe<Scalars["String"]["output"]>;
  genre: Maybe<Scalars["String"]["output"]>;
  playcount: Maybe<Scalars["String"]["output"]>;
  playlistId: Maybe<Scalars["Int"]["output"]>;
  title: Scalars["String"]["output"];
  year: Maybe<Scalars["String"]["output"]>;
};

export type SongAlbum = {
  __typename?: "songAlbum";
  artist: Scalars["String"]["output"];
  coverUrl: Scalars["String"]["output"];
  title: Scalars["String"]["output"];
};

export type SongInput = {
  album: InputMaybe<Scalars["String"]["input"]>;
  artist: Scalars["String"]["input"];
  songUrl: InputMaybe<Scalars["String"]["input"]>;
  title: Scalars["String"]["input"];
};

export type SongLyrics = {
  __typename?: "songLyrics";
  artist: Scalars["String"]["output"];
  lyrics: Scalars["String"]["output"];
  title: Scalars["String"]["output"];
};

export type SongVideo = {
  __typename?: "songVideo";
  artist: Scalars["String"]["output"];
  thumbnailUrl: Scalars["String"]["output"];
  title: Scalars["String"]["output"];
  videoId: Scalars["String"]["output"];
  videoUrl: Scalars["String"]["output"];
};

export type UpdateUserOutput = {
  __typename?: "updateUserOutput";
  email: Maybe<Scalars["String"]["output"]>;
  name: Maybe<Scalars["String"]["output"]>;
  updatedAt: Scalars["String"]["output"];
  username: Scalars["String"]["output"];
};

export type User = {
  __typename?: "user";
  accounts: Array<Account>;
  createdAt: Scalars["String"]["output"];
  email: Maybe<Scalars["String"]["output"]>;
  hasPassword: Scalars["Boolean"]["output"];
  id: Scalars["ID"]["output"];
  name: Maybe<Scalars["String"]["output"]>;
  updatedAt: Scalars["String"]["output"];
  username: Scalars["String"]["output"];
};

export type UserInput = {
  email: InputMaybe<Scalars["String"]["input"]>;
  name: InputMaybe<Scalars["String"]["input"]>;
  newPassword: InputMaybe<Scalars["String"]["input"]>;
  password: InputMaybe<Scalars["String"]["input"]>;
  username: Scalars["String"]["input"];
};

export type UserSong = {
  __typename?: "userSong";
  album: Maybe<Scalars["String"]["output"]>;
  artist: Scalars["String"]["output"];
  createdAt: Maybe<Scalars["String"]["output"]>;
  duration: Maybe<Scalars["String"]["output"]>;
  genre: Maybe<Scalars["String"]["output"]>;
  id: Scalars["String"]["output"];
  playcount: Maybe<Scalars["String"]["output"]>;
  playlistId: Maybe<Scalars["Int"]["output"]>;
  rank: Maybe<Scalars["String"]["output"]>;
  songUrl: Maybe<Scalars["String"]["output"]>;
  title: Scalars["String"]["output"];
  year: Maybe<Scalars["String"]["output"]>;
};

export type AddToPlaylistMutationMutationVariables = Exact<{
  playlistId: Scalars["ID"]["input"];
  songIds: InputMaybe<Array<Scalars["ID"]["input"]> | Scalars["ID"]["input"]>;
  songs: InputMaybe<Array<SongInput> | SongInput>;
}>;

export type AddToPlaylistMutationMutation = {
  __typename?: "Mutation";
  addToPlaylist: boolean;
};

export type ArtistQueryQueryVariables = Exact<{
  name: Scalars["String"]["input"];
}>;

export type ArtistQueryQuery = {
  __typename?: "Query";
  artist: {
    __typename: "artist";
    name: string;
    biography: string | null;
    bannerImage: string | null;
    genre: string | null;
    formedYear: string | null;
    twitter: string | null;
    disbanded: boolean | null;
    facebook: string | null;
    location: string | null;
    style: string | null;
    logo: string | null;
    image: string | null;
    website: string | null;
  };
};

export type CreatePlaylistMutationMutationVariables = Exact<{
  name: InputMaybe<Scalars["String"]["input"]>;
}>;

export type CreatePlaylistMutationMutation = {
  __typename?: "Mutation";
  createPlaylist: { __typename?: "playlist"; id: string; name: string };
};

export type CreateSongRadioMutationMutationVariables = Exact<{
  songId: InputMaybe<Scalars["ID"]["input"]>;
  songTitle: InputMaybe<Scalars["String"]["input"]>;
  songArtist: InputMaybe<Scalars["String"]["input"]>;
}>;

export type CreateSongRadioMutationMutation = {
  __typename?: "Mutation";
  createSongRadio: { __typename?: "playlist"; id: string; name: string };
};

export type DeletePlaylistMutationMutationVariables = Exact<{
  playlistId: Scalars["ID"]["input"];
}>;

export type DeletePlaylistMutationMutation = {
  __typename?: "Mutation";
  deletePlaylist: boolean;
};

export type GetAlbumBySongQueryQueryVariables = Exact<{
  artist: Scalars["String"]["input"];
  song: Scalars["String"]["input"];
}>;

export type GetAlbumBySongQueryQuery = {
  __typename?: "Query";
  getAlbumBySong: {
    __typename: "songAlbum";
    artist: string;
    coverUrl: string;
    title: string;
  };
};

export type GetAlbumsQueryQueryVariables = Exact<{
  artist: Scalars["String"]["input"];
  limit: Scalars["Int"]["input"];
}>;

export type GetAlbumsQueryQuery = {
  __typename?: "Query";
  getAlbums: Array<{
    __typename?: "album";
    artist: string;
    coverImage: string | null;
    description: string | null;
    genre: string | null;
    name: string;
    tracks: Array<string> | null;
    year: string | null;
  }> | null;
};

export type GetLyricsQueryQueryVariables = Exact<{
  artist: Scalars["String"]["input"];
  song: Scalars["String"]["input"];
}>;

export type GetLyricsQueryQuery = {
  __typename?: "Query";
  getLyrics: {
    __typename: "songLyrics";
    artist: string;
    lyrics: string;
    title: string;
  };
};

export type GetVideoInfoQueryQueryVariables = Exact<{
  query: Scalars["String"]["input"];
}>;

export type GetVideoInfoQueryQuery = {
  __typename?: "Query";
  getVideoInfo: Array<{
    __typename: "songVideo";
    artist: string;
    title: string;
    videoId: string;
    videoUrl: string;
    thumbnailUrl: string;
  }>;
};

export type ImportPlaylistMutationMutationVariables = Exact<{
  url: Scalars["String"]["input"];
  playlistId: InputMaybe<Scalars["ID"]["input"]>;
}>;

export type ImportPlaylistMutationMutation = {
  __typename?: "Mutation";
  importPlaylist: {
    __typename?: "playlist";
    name: string;
    id: string;
    user: { __typename?: "user"; id: string } | null;
  };
};

export type MeQueryQueryVariables = Exact<{ [key: string]: never }>;

export type MeQueryQuery = {
  __typename?: "Query";
  me: {
    __typename: "user";
    id: string;
    name: string | null;
    email: string | null;
    username: string;
    createdAt: string;
    hasPassword: boolean;
    accounts: Array<{ __typename: "account"; provider: string }>;
  };
};

export type RemoveFromPlaylistMutationMutationVariables = Exact<{
  playlistId: Scalars["ID"]["input"];
  songId: Scalars["ID"]["input"];
}>;

export type RemoveFromPlaylistMutationMutation = {
  __typename?: "Mutation";
  removeFromPlaylist: boolean;
};

export type SearchArtistQueryQueryVariables = Exact<{
  artist: Scalars["String"]["input"];
}>;

export type SearchArtistQueryQuery = {
  __typename?: "Query";
  searchArtists: Array<string>;
};

export type SimilarArtistsQueryQueryVariables = Exact<{
  artist: Scalars["String"]["input"];
  limit: InputMaybe<Scalars["Int"]["input"]>;
  onlyNames: InputMaybe<Scalars["Boolean"]["input"]>;
}>;

export type SimilarArtistsQueryQuery = {
  __typename?: "Query";
  similarArtists: Array<{
    __typename: "artist";
    name: string;
    image: string | null;
    bannerImage: string | null;
  }>;
};

export type TopsongsByArtistQueryQueryVariables = Exact<{
  artist: Scalars["String"]["input"];
}>;

export type TopsongsByArtistQueryQuery = {
  __typename?: "Query";
  topsongsByArtist: Array<{
    __typename: "song";
    artist: string;
    title: string;
    playcount: string | null;
  }>;
};

export type UpdatePlaylistSongRankMutationMutationVariables = Exact<{
  playlistId: Scalars["ID"]["input"];
  songId: Scalars["ID"]["input"];
  rank: Scalars["String"]["input"];
}>;

export type UpdatePlaylistSongRankMutationMutation = {
  __typename?: "Mutation";
  updatePlaylistSongRank: boolean;
};

export type UpdatePlaylistMutationMutationVariables = Exact<{
  playlistId: Scalars["ID"]["input"];
  name: Scalars["String"]["input"];
}>;

export type UpdatePlaylistMutationMutation = {
  __typename?: "Mutation";
  updatePlaylist: { __typename?: "playlist"; id: string; name: string };
};

export type UpdateUserMutationMutationVariables = Exact<{
  user: UserInput;
}>;

export type UpdateUserMutationMutation = {
  __typename?: "Mutation";
  updateUser: {
    __typename: "updateUserOutput";
    name: string | null;
    username: string;
    email: string | null;
    updatedAt: string;
  };
};

export type PlaylistQueryQueryVariables = Exact<{
  playlistId: Scalars["ID"]["input"];
}>;

export type PlaylistQueryQuery = {
  __typename?: "Query";
  playlist: {
    __typename?: "playlist";
    id: string;
    name: string;
    type: number | null;
    songs: Array<{
      __typename?: "userSong";
      id: string;
      title: string;
      artist: string;
      songUrl: string | null;
      rank: string | null;
      createdAt: string | null;
    }> | null;
    user: { __typename?: "user"; id: string; name: string | null } | null;
  };
};

export type UserPlaylistsQueryQueryVariables = Exact<{ [key: string]: never }>;

export type UserPlaylistsQueryQuery = {
  __typename?: "Query";
  userPlaylists: Array<{
    __typename?: "playlist";
    id: string;
    name: string;
    createdAt: string | null;
  }>;
};

export const AddToPlaylistMutationDocument = gql`
  mutation addToPlaylistMutation(
    $playlistId: ID!
    $songIds: [ID!]
    $songs: [songInput!]
  ) {
    addToPlaylist(playlistId: $playlistId, songIds: $songIds, songs: $songs)
  }
`;
export const ArtistQueryDocument = gql`
  query artistQuery($name: String!) {
    artist(name: $name) {
      name
      biography
      bannerImage
      genre
      formedYear
      twitter
      disbanded
      facebook
      location
      disbanded
      style
      logo
      image
      website
      __typename
    }
  }
`;
export const CreatePlaylistMutationDocument = gql`
  mutation createPlaylistMutation($name: String) {
    createPlaylist(name: $name) {
      id
      name
    }
  }
`;
export const CreateSongRadioMutationDocument = gql`
  mutation createSongRadioMutation(
    $songId: ID
    $songTitle: String
    $songArtist: String
  ) {
    createSongRadio(
      songId: $songId
      songTitle: $songTitle
      songArtist: $songArtist
    ) {
      id
      name
    }
  }
`;
export const DeletePlaylistMutationDocument = gql`
  mutation deletePlaylistMutation($playlistId: ID!) {
    deletePlaylist(playlistId: $playlistId)
  }
`;
export const GetAlbumBySongQueryDocument = gql`
  query getAlbumBySongQuery($artist: String!, $song: String!) {
    getAlbumBySong(artist: $artist, song: $song) {
      artist
      coverUrl
      title
      __typename
    }
  }
`;
export const GetAlbumsQueryDocument = gql`
  query getAlbumsQuery($artist: String!, $limit: Int!) {
    getAlbums(artist: $artist, limit: $limit, page: 1) {
      artist
      coverImage
      description
      genre
      name
      tracks
      year
    }
  }
`;
export const GetLyricsQueryDocument = gql`
  query getLyricsQuery($artist: String!, $song: String!) {
    getLyrics(artist: $artist, song: $song) {
      artist
      lyrics
      title
      __typename
    }
  }
`;
export const GetVideoInfoQueryDocument = gql`
  query getVideoInfoQuery($query: String!) {
    getVideoInfo(query: $query) {
      artist
      title
      videoId
      videoUrl
      thumbnailUrl
      __typename
    }
  }
`;
export const ImportPlaylistMutationDocument = gql`
  mutation importPlaylistMutation($url: String!, $playlistId: ID) {
    importPlaylist(url: $url, playlistId: $playlistId) {
      name
      id
      user {
        id
      }
    }
  }
`;
export const MeQueryDocument = gql`
  query meQuery {
    me {
      id
      name
      email
      username
      createdAt
      hasPassword
      accounts {
        provider
        __typename
      }
      __typename
    }
  }
`;
export const RemoveFromPlaylistMutationDocument = gql`
  mutation removeFromPlaylistMutation($playlistId: ID!, $songId: ID!) {
    removeFromPlaylist(playlistId: $playlistId, songId: $songId)
  }
`;
export const SearchArtistQueryDocument = gql`
  query searchArtistQuery($artist: String!) {
    searchArtists(artist: $artist)
  }
`;
export const SimilarArtistsQueryDocument = gql`
  query similarArtistsQuery(
    $artist: String!
    $limit: Int
    $onlyNames: Boolean
  ) {
    similarArtists(artist: $artist, limit: $limit, onlyNames: $onlyNames) {
      name
      image
      bannerImage
      __typename
    }
  }
`;
export const TopsongsByArtistQueryDocument = gql`
  query topsongsByArtistQuery($artist: String!) {
    topsongsByArtist(artist: $artist) {
      artist
      title
      playcount
      __typename
    }
  }
`;
export const UpdatePlaylistSongRankMutationDocument = gql`
  mutation updatePlaylistSongRankMutation(
    $playlistId: ID!
    $songId: ID!
    $rank: String!
  ) {
    updatePlaylistSongRank(
      playlistId: $playlistId
      songId: $songId
      rank: $rank
    )
  }
`;
export const UpdatePlaylistMutationDocument = gql`
  mutation updatePlaylistMutation($playlistId: ID!, $name: String!) {
    updatePlaylist(name: $name, playlistId: $playlistId) {
      id
      name
    }
  }
`;
export const UpdateUserMutationDocument = gql`
  mutation updateUserMutation($user: userInput!) {
    updateUser(user: $user) {
      name
      username
      email
      updatedAt
      __typename
    }
  }
`;
export const PlaylistQueryDocument = gql`
  query playlistQuery($playlistId: ID!) {
    playlist(playlistId: $playlistId) {
      id
      name
      type
      songs {
        id
        title
        artist
        songUrl
        rank
        createdAt
      }
      user {
        id
        name
      }
    }
  }
`;
export const UserPlaylistsQueryDocument = gql`
  query userPlaylistsQuery {
    userPlaylists {
      id
      name
      createdAt
    }
  }
`;

export type SdkFunctionWrapper = <T>(
  action: (requestHeaders?: Record<string, string>) => Promise<T>,
  operationName: string,
  operationType?: string,
  variables?: any,
) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (
  action,
  _operationName,
  _operationType,
  _variables,
) => action();

export function getSdk(
  client: GraphQLClient,
  withWrapper: SdkFunctionWrapper = defaultWrapper,
) {
  return {
    addToPlaylistMutation(
      variables: AddToPlaylistMutationMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<AddToPlaylistMutationMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<AddToPlaylistMutationMutation>(
            AddToPlaylistMutationDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders },
          ),
        "addToPlaylistMutation",
        "mutation",
        variables,
      );
    },
    artistQuery(
      variables: ArtistQueryQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<ArtistQueryQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ArtistQueryQuery>(ArtistQueryDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        "artistQuery",
        "query",
        variables,
      );
    },
    createPlaylistMutation(
      variables?: CreatePlaylistMutationMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<CreatePlaylistMutationMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<CreatePlaylistMutationMutation>(
            CreatePlaylistMutationDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders },
          ),
        "createPlaylistMutation",
        "mutation",
        variables,
      );
    },
    createSongRadioMutation(
      variables?: CreateSongRadioMutationMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<CreateSongRadioMutationMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<CreateSongRadioMutationMutation>(
            CreateSongRadioMutationDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders },
          ),
        "createSongRadioMutation",
        "mutation",
        variables,
      );
    },
    deletePlaylistMutation(
      variables: DeletePlaylistMutationMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<DeletePlaylistMutationMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DeletePlaylistMutationMutation>(
            DeletePlaylistMutationDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders },
          ),
        "deletePlaylistMutation",
        "mutation",
        variables,
      );
    },
    getAlbumBySongQuery(
      variables: GetAlbumBySongQueryQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<GetAlbumBySongQueryQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetAlbumBySongQueryQuery>(
            GetAlbumBySongQueryDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders },
          ),
        "getAlbumBySongQuery",
        "query",
        variables,
      );
    },
    getAlbumsQuery(
      variables: GetAlbumsQueryQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<GetAlbumsQueryQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetAlbumsQueryQuery>(
            GetAlbumsQueryDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders },
          ),
        "getAlbumsQuery",
        "query",
        variables,
      );
    },
    getLyricsQuery(
      variables: GetLyricsQueryQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<GetLyricsQueryQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetLyricsQueryQuery>(
            GetLyricsQueryDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders },
          ),
        "getLyricsQuery",
        "query",
        variables,
      );
    },
    getVideoInfoQuery(
      variables: GetVideoInfoQueryQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<GetVideoInfoQueryQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetVideoInfoQueryQuery>(
            GetVideoInfoQueryDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders },
          ),
        "getVideoInfoQuery",
        "query",
        variables,
      );
    },
    importPlaylistMutation(
      variables: ImportPlaylistMutationMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<ImportPlaylistMutationMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ImportPlaylistMutationMutation>(
            ImportPlaylistMutationDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders },
          ),
        "importPlaylistMutation",
        "mutation",
        variables,
      );
    },
    meQuery(
      variables?: MeQueryQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<MeQueryQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<MeQueryQuery>(MeQueryDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        "meQuery",
        "query",
        variables,
      );
    },
    removeFromPlaylistMutation(
      variables: RemoveFromPlaylistMutationMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<RemoveFromPlaylistMutationMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<RemoveFromPlaylistMutationMutation>(
            RemoveFromPlaylistMutationDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders },
          ),
        "removeFromPlaylistMutation",
        "mutation",
        variables,
      );
    },
    searchArtistQuery(
      variables: SearchArtistQueryQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<SearchArtistQueryQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<SearchArtistQueryQuery>(
            SearchArtistQueryDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders },
          ),
        "searchArtistQuery",
        "query",
        variables,
      );
    },
    similarArtistsQuery(
      variables: SimilarArtistsQueryQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<SimilarArtistsQueryQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<SimilarArtistsQueryQuery>(
            SimilarArtistsQueryDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders },
          ),
        "similarArtistsQuery",
        "query",
        variables,
      );
    },
    topsongsByArtistQuery(
      variables: TopsongsByArtistQueryQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<TopsongsByArtistQueryQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<TopsongsByArtistQueryQuery>(
            TopsongsByArtistQueryDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders },
          ),
        "topsongsByArtistQuery",
        "query",
        variables,
      );
    },
    updatePlaylistSongRankMutation(
      variables: UpdatePlaylistSongRankMutationMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<UpdatePlaylistSongRankMutationMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<UpdatePlaylistSongRankMutationMutation>(
            UpdatePlaylistSongRankMutationDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders },
          ),
        "updatePlaylistSongRankMutation",
        "mutation",
        variables,
      );
    },
    updatePlaylistMutation(
      variables: UpdatePlaylistMutationMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<UpdatePlaylistMutationMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<UpdatePlaylistMutationMutation>(
            UpdatePlaylistMutationDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders },
          ),
        "updatePlaylistMutation",
        "mutation",
        variables,
      );
    },
    updateUserMutation(
      variables: UpdateUserMutationMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<UpdateUserMutationMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<UpdateUserMutationMutation>(
            UpdateUserMutationDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders },
          ),
        "updateUserMutation",
        "mutation",
        variables,
      );
    },
    playlistQuery(
      variables: PlaylistQueryQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<PlaylistQueryQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<PlaylistQueryQuery>(PlaylistQueryDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        "playlistQuery",
        "query",
        variables,
      );
    },
    userPlaylistsQuery(
      variables?: UserPlaylistsQueryQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<UserPlaylistsQueryQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<UserPlaylistsQueryQuery>(
            UserPlaylistsQueryDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders },
          ),
        "userPlaylistsQuery",
        "query",
        variables,
      );
    },
  };
}
export type Sdk = ReturnType<typeof getSdk>;
