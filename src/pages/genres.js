import { useSession, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from "next/router";

const Genres = () => {
  const { data: session, status, update } = useSession()
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const availableGenres = [
    'Pop',
    'Rock',
    'Hip-Hop',
    'Electronic',
    'R&B',
    'Country',
    'Jazz',
    'Classical',
    'Folk',
    'Indie',
  ];
  const router = useRouter();
  const redirect = () =>{
    router.push('/');
}
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
    if (savedSuccessfully) {
      router.push('/');
      setSavedSuccessfully(false);
    }
  }, [savedSuccessfully, router]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }
  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div style={containerStyle}>
        <main style={mainStyle}>
          <h1 style={headingStyle}>Select Your Favorite Genres</h1>
          {status === 'authenticated' && (
            <>
              <ul style={genreListStyle}>
                {availableGenres.map((genre) => (
                  <li key={genre} style={genreItemStyle}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedGenres.includes(genre)}
                        onChange={() => handleGenreToggle(genre)}
                      />
                      {genre}
                    </label>
                  </li>
                ))}
              </ul>
              <button onClick={handleSaveGenres} style={saveButtonStyle}>Save Genres</button>
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
  fontFamily: 'Arial, sans-serif',
  backgroundColor: '#f8f8f8',
  minHeight: '100vh',
  padding: '0 1rem',
};

const mainStyle = {
  maxWidth: '800px',
  margin: '0 auto',
  padding: '2rem 0',
};

const headingStyle = {
  textAlign: 'center',
  color: '#333',
};

const genreListStyle = {
  listStyleType: 'none',
  padding: 0,
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1rem',
  justifyContent: 'center',
};

const genreItemStyle = {
  backgroundColor: '#fff',
  padding: '1rem',
  borderRadius: '8px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
};

const saveButtonStyle = {
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

export default Genres;
