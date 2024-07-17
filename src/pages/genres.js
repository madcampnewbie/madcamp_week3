import { useSession, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from "next/router";
const addFontFace = () => {
  const fontFace1 = `
    @font-face {
      font-family: 'VITRO';
      src: url('/fonts/VITRO.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
  `;
  const fontFace2 = `
    @font-face {
      font-family: 'VITROpride';
      src: url('/fonts/VITROpride.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
  `;
  // 새로운 스타일 시트를 생성하고 @font-face 규칙을 추가
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = fontFace1 + fontFace2;
  document.head.appendChild(styleSheet);
};
const Genres = () => {
  const { data: session, status, update } = useSession()
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const availableGenres = [
    { name: "Pop", image: "/pop.png" },
    { name: "Rock", image: "/rock.png" },
    { name: "Hip-Hop/Rap", image: "/hip-hop.png" },
    { name: "Electronic/Dance", image: "/dance.png" },
    { name: "Jazz", image: "/jazz.png" },
    { name: "Classical", image: "classic.png" },
    { name: "R&B/Soul", image: "/soul.png" },
    { name: "Country", image: "/country.png" },
    { name: "Reggae", image: "/reggae.png" },
    { name: "Latin", image: "/latin.png" },
    { name: "K-Pop", image: "/kpop.png" },
    { name: "Metal", image: "/metal.png" },
    { name: "Alternative/Indie", image: "/indie.png" },
    { name: "Blues", image: "/blues.png" },
    { name: "Folk", image: "/folk.png" },
    { name: "Punk", image: "/punk.png" },
  ];

  const router = useRouter();

  const handleGenreToggle = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleSaveGenres = () => {
    fetch('/api/user-genres', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ genres: selectedGenres }),
    }).then((response) => {
      if (response.ok) {
        alert('Genres saved successfully!');
        setSavedSuccessfully(true);
      } else {
        alert('Failed to save genres.');
      }
    });
  };

  useEffect(() => {
    addFontFace
    if (savedSuccessfully) {
      router.push('/');
      setSavedSuccessfully(false);
    }
  }, [savedSuccessfully, router]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div style={containerStyle}>
        <main style={mainStyle}>
          <h1 style={headingStyle}>당신의 음악 취향을 선택하세요!</h1>
          {status === 'authenticated' && (
            <>
              <ul style={genreListStyle}>
                {availableGenres.map((genre) => (
                  <li
                    key={genre.name}
                    style={{
                      ...genreItemStyle,
                      backgroundColor: selectedGenres.includes(genre.name) ? '#0070f3' : '#fff',
                      color: selectedGenres.includes(genre.name) ? '#fff' : '#000',
                    }}
                    onClick={() => handleGenreToggle(genre.name)}
                  >
                    <img src={genre.image} alt={genre.name} style={genreImageStyle} />
                    <label style={labelStyle}>
                      <span style={genreNameStyle}>{genre.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
              <button onClick={handleSaveGenres} style={saveButtonStyle}>장르 저장</button>
            </>
          )}
          {status !== 'authenticated' && (
            <div style={signInContainerStyle}>
              <p>Please sign in to select your favorite genres.</p>
              <button onClick={() => signIn('spotify')} style={signInButtonStyle}>Sign in with Spotify</button>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

const containerStyle = {
  fontFamily: 'VITRO, Arial, sans-serif',
  backgroundColor: '#f8f8f8',
  minHeight: '100vh',
  padding: '0 1rem',
  backgroundSize: 'contain', // 이미지 크기를 고정
  backgroundAttachment: 'fixed', // 배경 이미지 고정
  backgroundColor: '#f8f8f8',
  backgroundImage: 'url(/serene_landscape_background.png)', // 배경 이미지 경로
  backgroundSize: 'cover', // 이미지가 화면을 덮도록 조정
  backgroundPosition: 'center', // 이미지가 중앙에 위치하도록 조정
};

const mainStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '2rem 0',
};

const headingStyle = {
  fontFamily: 'VITRO, Arial, sans-serif',
  textAlign: 'center',
  color: '#000',
  fontSize: '2rem',
};

const genreListStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '4rem',
  padding: 0,
  listStyleType: 'none',
  justifyContent: 'center',
};

const genreItemStyle = {
  backgroundColor: '#fff',
  padding: '1rem',
  borderRadius: '8px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  textAlign: 'center',
  width: '100%',
  cursor: 'pointer', // Add pointer cursor to indicate the item is clickable
  transition: 'background-color 0.3s, color 0.3s', // Smooth transition for background color and text color
};

const genreImageStyle = {
  width: '100%',
  height: 'auto',
  borderRadius: '4px',
  marginBottom: '0.5rem',
};

const saveButtonStyle = {
  fontFamily: 'VITROpride, Arial, sans-serif',
  fontWeight: 'bold',
  padding: '0.75rem 1rem',
  fontSize: '1rem',
  borderRadius: '4px',
  border: 'none',
  backgroundColor: '#0070f3',
  color: '#fff',
  cursor: 'pointer',
  display: 'block',
  margin: '2rem auto 0',
};

const signInContainerStyle = {
  textAlign: 'center',
};

const signInButtonStyle = {
  padding: '0.75rem 1rem',
  fontSize: '1rem',
  borderRadius: '4px',
  border: 'none',
  backgroundColor: '#0070f3',
  color: '#fff',
  cursor: 'pointer',
};

const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const genreNameStyle = {
  marginTop: '0.5rem',
  fontSize: '1rem',
};

export default Genres;
