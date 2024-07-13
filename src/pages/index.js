import { useSession, signOut, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [diaries, setDiaries] = useState([]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDiaries();
    }
  }, [status]);

  const fetchDiaries = async () => {
    try {
      const response = await fetch('/api/diary');
      const data = await response.json();
      if (Array.isArray(data)) {
        setDiaries(data);
      } else {
        console.error('API response is not an array:', data);
        setDiaries([]);
      }
    } catch (error) {
      console.error('Error fetching diaries:', error);
      setDiaries([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/diary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content }),
    });
    const newDiary = await res.json();
    setDiaries([...diaries, newDiary]);
    setTitle('');
    setContent('');
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

      // Initial call to set the underline width correctly
      updateUnderlineWidth();
    });
  }, []);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

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
      </div>
    </div>
  );
}
