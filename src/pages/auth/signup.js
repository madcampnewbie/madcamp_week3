import { useState } from 'react';
import { useRouter } from 'next/router';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (response.ok) {
        router.push('/auth/signin');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to sign up');
      }
    } catch (error) {
      console.error('Failed to sign up:', error);
      setError('Failed to sign up');
    }
  };

  return (
    <div className="signup-container">
      <h1>Sign Up</h1>
      <form className="signup-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input 
            className="signup-input" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            type="text" 
            required 
          />
        </label>
        <br />
        <label>
          Email
          <input 
            className="signup-input" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            type="email" 
            required 
          />
        </label>
        <br />
        <label>
          Password
          <input 
            className="signup-input" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            type="password" 
            required 
          />
        </label>
        <br />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Sign up</button>
      </form>
    </div>
  );
}
