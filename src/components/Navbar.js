import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="navbar">
      <Link href="/" style={{ marginRight: '1rem' }}>
        Home
      </Link>
      {!session && (
        <>
          <button onClick={() => signIn()} style={{ marginRight: '1rem' }}>Sign in</button>
          <button onClick={() => window.location.href='/auth/signup'}>Sign up</button>
        </>
      )}
      {session && (
        <>
          <span style={{ marginRight: '1rem' }}>Welcome, {session.user.name}</span>
          <button onClick={() => signOut()}>Sign out</button>
        </>
      )}
    </nav>
  );
}
