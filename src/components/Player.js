import { useEffect, useState } from "react";
import axios from 'axios';

const Player = ({ token, playlist, reasons }) => {
  const [player, setPlayer] = useState(null);
  const [isPaused, setIsPaused] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [deviceId, setDeviceId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const [translatedReasons, setTranslatedReasons] = useState([]);

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
            setCurrentTrack({
              name: state.track_window.current_track?.name || '',
              artists: state.track_window.current_track?.artists || [],
              imageUrl: state.track_window.current_track?.album?.images[0]?.url || '', // Track image URL
            });
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

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        player.getCurrentState().then(state => {
          if (state) {
            setProgress(state.position);
          }
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, player]);

  useEffect(() => {
    const translateReasons = async () => {
      const translated = await Promise.all(reasons.map(reason => translate(reason)));
      setTranslatedReasons(translated);
    };

    translateReasons();
  }, [reasons]);

  const decodeHTML = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.documentElement.textContent;
  };

  const translate = async (text, targetLang = 'ko') => {
    const apiKey = 'AIzaSyCNvfmrsSLKfTMMIDNk8oLkFUUoFmGUWXY';
    const url = 'https://translation.googleapis.com/language/translate/v2';

    try {
      const response = await axios.post(url, null, {
        params: {
          q: text,
          target: targetLang,
          key: apiKey,
        },
      });

      const translatedText = response.data.data.translations[0].translatedText;
      return decodeHTML(translatedText);
    } catch (error) {
      console.error('Error translating text:', error);
      return text; // 원본 텍스트를 반환
    }
  };

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

  const playPrevTrack = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex - 1 + playlist.length) % playlist.length);
  };

  const handleProgressChange = (event) => {
    const newPosition = (event.target.value / 100) * duration;
    player.seek(newPosition).then(() => {
      setProgress(newPosition);
    });
  };

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  if (!player) return <p>Loading player...</p>;

  return (
    <div style={playerContainerStyle}>
      <p onClick={toggleExpansion} style={toggleTextStyle}>
        {isExpanded ? '간략히^' : '확대v'}
      </p>
      {currentTrack && isExpanded && (
        <div style={trackInfoStyle}>
          <img src={currentTrack.imageUrl} alt={currentTrack.name} style={trackImageStyle} />
          <p style={trackNameStyle}>{currentTrack.name}</p>
          <p style={artistNameStyle}>{currentTrack.artists.map(artist => artist.name).join(', ')}</p>
        </div>
      )}
      <input
        type="range"
        value={(progress / duration) * 100}
        onChange={handleProgressChange}
        style={progressBarStyle}
      />
      <div style={buttonContainerStyle}>
        <button onClick={playPrevTrack} style={controlButtonStyle}>Prev</button>
        <button onClick={() => player.togglePlay()} style={controlButtonStyle}>
          {isPaused ? 'Play' : 'Pause'}
        </button>
        <button onClick={playNextTrack} style={controlButtonStyle}>Next</button>
      </div>
      {translatedReasons.length > 0 && <p style={reasonTextStyle}>{translatedReasons[currentTrackIndex]}</p>}
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
  margin: '1rem',
  position: 'fixed', // 고정 위치로 설정
  top: '80px', // 원하는 위치로 조정
  left: '120px', // 원하는 위치로 조정
};

const toggleTextStyle = {
  cursor: 'pointer',
  textDecoration: 'underline',
  color: '#fff',
  marginBottom: '1rem',
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

const trackImageStyle = {
  width: '100%',
  height: 'auto',
  borderRadius: '8px',
  marginBottom: '1rem',
};

const progressBarStyle = {
  width: '100%',
  marginBottom: '1rem',
};

const buttonContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
};

const controlButtonStyle = {
  padding: '0.75rem 1rem',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: '#1db954',
  color: '#fff',
  cursor: 'pointer',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
};

const reasonTextStyle = {
  marginTop: '1rem',
  fontSize: '0.9rem',
  color: '#fff',
  textAlign: 'center',
};

export default Player;
