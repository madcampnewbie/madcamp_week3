import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [diaries, setDiaries] = useState([]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/diary')
        .then((response) => response.json())
        .then((data) => setDiaries(data));
    }
  }, [status]);

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

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Diary App</h1>
      {status === 'authenticated' && (
        <>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              className="textarea-notebook"
              placeholder="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>
            <button type="submit">Add Diary</button>
          </form>
          <ul>
            {diaries.map((diary, index) => (
              <li key={index} className="diary-item">
                <h2>{diary.title}</h2>
                <p>{diary.content}</p>
                <small>{new Date(diary.date).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
