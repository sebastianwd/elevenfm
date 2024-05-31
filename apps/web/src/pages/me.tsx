import { useSession } from 'next-auth/react'

const UserPlaylists = () => {
  const { data: session, status } = useSession()
  return (
    <div>
      {JSON.stringify(session, null, 2)}
      {status}
      <h1>Playlists</h1>
    </div>
  )
}

export default UserPlaylists
