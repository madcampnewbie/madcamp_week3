import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
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
export default function Navbar() {
  const { data: session, status } = useSession();
  const [genres, setGenres] = useState([]);
  const router = useRouter();

  useEffect(() => {
    addFontFace
    const fetchGenres = async () => {
      if (status === 'authenticated') {
        try {
          const response = await fetch('/api/user-genres');
          const data = await response.json();
          setGenres(data.genres || []);
        } catch (error) {
          console.error('Error fetching user genres:', error);
        }
      }
    };

    fetchGenres();
  }, [status, router.asPath]);

  return (
    <nav style={navStyle}>
    <div style={linkContainerStyle}>
      <Link href="/genres" style={linkStyle}>Genre Selection</Link>
      <span>{genres.join(', ')}</span>
    </div>
    <h1 style={headingStyle}>산들바람</h1>
    <div style={buttonContainerStyle}>
        {!session && (
          <>
            <button onClick={() => signIn("spotify")} style={buttonStyle}>Sign in</button>
            <button onClick={() => window.location.href='/auth/signup'} style={buttonStyle}>Sign up</button>
          </>
        )}
        {session && (
          <>
            <span style={welcomeStyle}>Welcome, {session.user?.email || 'User1'}</span>
            <button onClick={() => signOut()} style={buttonStyle}>Sign out</button>
          </>
        )}
      </div>
    </nav>
  );
}
const headingStyle = {
  margin: '0 auto',
  color: '#000',
  fontFamily: 'VITRO, Arial, sans-serif',
  fontSize: '2rem',
};
const navStyle = {
  fontFamily: 'VITRO, Arial, sans-serif',
  padding: '1rem',
  borderBottom: '1px solid #ccc',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#fff',
};

const linkContainerStyle = {
  display: 'flex',
  alignItems: 'center',
};

const linkStyle = {
  marginRight: '1rem',
  textDecoration: 'none',
  color: '#0070f3',
  fontSize: '1.2rem',
};

const buttonContainerStyle = {
  display: 'flex',
  alignItems: 'center',
};

const buttonStyle = {
  fontFamily: 'VITROpride, Arial, sans-serif',
  marginRight: '1rem',
  padding: '0.5rem 1rem',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: '#0070f3',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: 'bold',
};

const welcomeStyle = {
  marginRight: '1rem',
  fontSize: '1rem',
  color: '#333',
};
