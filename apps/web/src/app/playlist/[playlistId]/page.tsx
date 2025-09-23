import { PlaylistPage } from '~/components/pages/playlist'

export default async function Playlist({
  params,
}: {
  params: Promise<{ playlistId: string }>
}) {
  const { playlistId } = await params

  return <PlaylistPage playlistId={playlistId} />
}
