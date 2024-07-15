import { useEffect, useState } from "react";

const Player = ({ token, playlist }) => {
  const [player, setPlayer] = useState(null);
  const [isPaused, setIsPaused] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    if (!token) {
      console.error('Token is not available');
      return;
    }

    const loadSpotifyPlayer = () => {
      if (window.Spotify) {
        const spotifyPlayer = new window.Spotify.Player({
          name: 'Web Playback SDK',
          getOAuthToken: cb => { cb(token); },
          volume: 0.5,
        });

        setPlayer(spotifyPlayer);

        spotifyPlayer.addListener('ready', ({ device_id }) => {
          console.log('Ready with Device ID', device_id);
          setDeviceId(device_id);
        });

        spotifyPlayer.addListener('not_ready', ({ device_id }) => {
          console.log('Device ID has gone offline', device_id);
        });

        spotifyPlayer.addListener('player_state_changed', state => {
          if (state) {
            setCurrentTrack(state.track_window.current_track);
            setIsPaused(state.paused);

            // If the track has ended, play the next track
            if (state.paused && state.position === 0 && state.track_window.previous_tracks.find(track => track.id === state.track_window.current_track.id)) {
              playNextTrack();
            }
          }
        });

        spotifyPlayer.connect();
      } else {
        console.error('Spotify Player SDK not available');
      }
    };

    if (typeof window !== 'undefined') {
      if (window.Spotify) {
        loadSpotifyPlayer();
      } else {
        window.onSpotifyWebPlaybackSDKReady = loadSpotifyPlayer;
      }
    }
  }, [token]);

  useEffect(() => {
    if (player && deviceId && playlist && playlist.length > 0) {
      playSong(playlist[currentTrackIndex], deviceId);
    }
  }, [currentTrackIndex, player, deviceId, playlist]);

  const playSong = async (spotifyUri, deviceId) => {
    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ uris: [spotifyUri] }),
      });

      if (response.ok) {
        console.log('Playback started');
      } else {
        const error = await response.json();
        console.error('Failed to start playback:', error);
      }
    } catch (error) {
      console.error('Error starting playback:', error);
    }
  };

  const playNextTrack = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % playlist.length);
  };

  if (!player) return null;

  return (
    <div style={playerContainerStyle}>
      {currentTrack && (
        <div style={trackInfoStyle}>
          <p style={trackNameStyle}>{currentTrack.name}</p>
          <p style={artistNameStyle}>{currentTrack.artists[0].name}</p>
        </div>
      )}
      <button onClick={() => player.togglePlay()} style={playButtonStyle}>
        {isPaused ? 'Play' : 'Pause'}
      </button>
      <button onClick={playNextTrack} style={nextButtonStyle}>Next</button>
    </div>
  );
};

const playerContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#f0f0f0',
  padding: '0.5rem 1rem',
  borderRadius: '4px',
};

const trackInfoStyle = {
  marginRight: '1rem',
};

const trackNameStyle = {
  margin: 0,
  fontWeight: 'bold',
};

const artistNameStyle = {
  margin: 0,
  color: '#666',
};

const playButtonStyle = {
  padding: '0.5rem 1rem',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: '#0070f3',
  color: '#fff',
  cursor: 'pointer',
  marginRight: '0.5rem',
};

const nextButtonStyle = {
  padding: '0.5rem 1rem',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: '#28a745',
  color: '#fff',
  cursor: 'pointer',
};

export default Player;
