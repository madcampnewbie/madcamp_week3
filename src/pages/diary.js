import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import styles from '../styles/Diary.module.css';

export default function Diary() {
  const { data: session, status } = useSession();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [diaries, setDiaries] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDiaries();
    }
  }, [status]);

  const fetchDiaries = async () => {
    try {
      const response = await fetch('/api/diary');
      if (response.ok) {
        const data = await response.json();
        setDiaries(data);
      } else {
        throw new Error('Failed to fetch diaries');
      }
    } catch (error) {
      console.error('Error fetching diaries:', error);
      setDiaries([]);
      setError('Failed to fetch diaries');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/diary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      });

      if (res.ok) {
        const newDiary = await res.json();
        setDiaries([...diaries, newDiary]);
        setTitle('');
        setContent('');
      } else {
        throw new Error('Failed to add diary');
      }
    } catch (error) {
      console.error('Error adding diary:', error);
      setError('Failed to add diary');
    }
  };

  useEffect(() => {
    const inputs = document.querySelectorAll('.dynamic-underline');
    inputs.forEach(input => {
      const underline = document.createElement('div');
      underline.className = 'underline';
      input.parentNode.insertBefore(underline, input.nextSibling);

      const updateUnderlineWidth = () => {
        const inputLength = input.value.length;
        underline.style.width = `${inputLength + 1}ch`;
      };

      input.addEventListener('input', updateUnderlineWidth);
      input.addEventListener('focus', updateUnderlineWidth);
      input.addEventListener('blur', () => {
        if (input.value.length === 0) {
          underline.style.width = '0';
        }
      });

      updateUnderlineWidth();
    });
  }, []);

  return (
    <div className="container">
      <div className="content">
        <h1>Diary&Music</h1>
        {status === 'authenticated' && (
          <>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                className="title-input dynamic-underline"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                className="content-textarea"
                placeholder="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              ></textarea>
              <button type="submit">Add Diary</button>
            </form>
            <ul>
              {diaries.length > 0 ? (
                diaries.map((diary, index) => (
                  <li key={index} className="diary-item">
                    <h2>{diary.title}</h2>
                    <p>{diary.content}</p>
                    <small>{new Date(diary.date).toLocaleString()}</small>
                  </li>
                ))
              ) : (
                <p>No diaries available.</p>
              )}
            </ul>
          </>
        )}
        {status !== 'authenticated' && (
          <p>
            Please <a href="#" onClick={() => signIn()}>sign in</a> to view and add diaries.
          </p>
        )}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
}
