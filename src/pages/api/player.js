import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export default async (req, res) => {
  const token = await getToken({ req, secret });

  if (!token) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  const accessToken = token.accessToken;

  if (!accessToken) {
    res.status(401).json({ message: 'No access token available' });
    return;
  }

  if (req.method === 'PUT') {
    const { spotifyUri } = req.body;

    if (!spotifyUri) {
      res.status(400).json({ message: 'Spotify URI is required' });
      return;
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/play`, {
        method: 'PUT',
        body: JSON.stringify({ uris: [spotifyUri] }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        res.status(200).json({ message: 'Playback started' });
      } else {
        const error = await response.json();
        res.status(response.status).json(error);
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to start playback', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
