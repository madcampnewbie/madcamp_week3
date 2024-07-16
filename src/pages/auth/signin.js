import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function SignIn() {
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSignIn = async () => {
    const result = await signIn('spotify', { redirect: false });

    if (result.error) {
      setError(result.error);
    } else {
      router.push('/');
    }
  };

  return (
    <div>
      <h1>Sign In</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleSignIn}>Sign in with Spotify</button>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (session) {
    return {
      redirect: { destination: '/', permanent: false },
    };
  }

  return {
    props: {},
  };
}
