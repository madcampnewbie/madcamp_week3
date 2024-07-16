import { useEffect, useState } from "react";

const Player = ({ token, playlist }) => {
  const [player, setPlayer] = useState(null);
  const [isPaused, setIsPaused] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [deviceId, setDeviceId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

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
            setProgress(state.position);
            setDuration(state.duration);

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
      <div style={progressBarContainerStyle}>
        <div style={{ ...progressBarStyle, width: `${(progress / duration) * 100}%` }}></div>
      </div>
      <button onClick={() => player.togglePlay()} style={playButtonStyle}>
        {isPaused ? 'Play' : 'Pause'}
      </button>
      <button onClick={playNextTrack} style={nextButtonStyle}>Next</button>
    </div>
  );
};

const playerContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: '#282c34',
  padding: '1rem',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  maxWidth: '300px',
  margin: '1rem auto',
};

const trackInfoStyle = {
  marginBottom: '1rem',
  textAlign: 'center',
};

const trackNameStyle = {
  margin: 0,
  fontWeight: 'bold',
  fontSize: '1.1rem',
  color: '#fff',
};

const artistNameStyle = {
  margin: 0,
  color: '#ccc',
};

const progressBarContainerStyle = {
  width: '100%',
  height: '10px',
  backgroundColor: '#444',
  borderRadius: '5px',
  overflow: 'hidden',
  marginBottom: '1rem',
};

const progressBarStyle = {
  height: '100%',
  backgroundColor: '#1db954',
};

const playButtonStyle = {
  padding: '0.75rem 1.5rem',
  border: 'none',
  borderRadius: '50%',
  backgroundColor: '#1db954',
  color: '#fff',
  cursor: 'pointer',
  marginBottom: '0.5rem',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
};

const nextButtonStyle = {
  padding: '0.5rem 1rem',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: '#5352ed',
  color: '#fff',
  cursor: 'pointer',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
};

export default Player;
