import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Navbar() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  return (
    <nav style={navStyle}>
      <div style={linkContainerStyle}>
      <Link href="/genres" style={linkStyle}>Genre Selection</Link>
      </div>
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

const navStyle = {
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
  marginRight: '1rem',
  padding: '0.5rem 1rem',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: '#0070f3',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '1rem',
};

const welcomeStyle = {
  marginRight: '1rem',
  fontSize: '1rem',
  color: '#333',
};
