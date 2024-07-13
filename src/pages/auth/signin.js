import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result.error) {
      setError(result.error);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="signin-container">
      <h1>Sign In</h1>
      <form className="signin-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input className="signin-input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <br />
        <label>
          Password
          <input className="signin-input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>
        <br />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Sign in</button>
      </form>
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
