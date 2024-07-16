import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { fetchWeather } from '../libs/weather';
import Player from '../components/Player';

export default function Home() {
  const { data: session, status } = useSession();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [diaries, setDiaries] = useState([]);
  const [weather, setWeather] = useState(null);
  const [musicRecommendations, setMusicRecommendations] = useState([]);
  const [genres, setGenres] = useState([]);
  const [news, setNews] = useState({});
  const [isNewsVisible, setIsNewsVisible] = useState(false);

  const topNavBarHeight = '80px'; // Adjust this value according to the actual height of your top navigation bar

  const WeatherIcon = ({ iconCode, description }) => {
    const iconUrl = `http://openweathermap.org/img/wn/${iconCode}.png`;

    return (
      <img src={iconUrl} alt={description} />
    );
  };

  const stripHtmlTags = (text) => {
    const doc = new DOMParser().parseFromString(text, 'text/html');
    return doc.body.textContent || '';
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/diary')
        .then((response) => response.json())
        .then((data) => setDiaries(data));

      // Fetch user's genres
      fetch('/api/user-genres')
        .then((response) => response.json())
        .then((data) => setGenres(data.genres || []));

      // Fetch news data
      fetch('/api/news')
        .then((response) => response.json())
        .then((data) => setNews(data));
    }
  }, [status]);

  useEffect(() => {
    fetchWeather()
      .then(setWeather)
      .catch((error) => console.error('Failed to fetch weather data:', error));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/diary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content, weather }),
    });
    const newDiary = await res.json();
    setDiaries([...diaries, newDiary]);
    setTitle('');
    setContent('');

    // Fetch music recommendations
    const recommendationRes = await fetch('/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ diary_entry: content, genre: genres || 'hip-hop' }),
    });
    const recommendations = await recommendationRes.json();

    setMusicRecommendations(recommendations.map(rec => rec.spotify_link));
  };

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  return (
    <div style={containerStyle}>
      <button
        onClick={() => setIsNewsVisible(!isNewsVisible)}
        style={{ ...newsButtonStyle, display: isNewsVisible ? 'none' : 'block' }}
      >
        News 보기
      </button>
      <main style={mainStyle}>
        <h1 style={headingStyle}>무슨 이름이 좋을까</h1>
        {status === 'authenticated' && (
          <>
            {weather && (
              <div style={weatherStyle}>
                <WeatherIcon iconCode={weather.weather[0].icon} description={weather.weather[0].description} />
                <p>Temperature: {weather.main.temp}°C</p>
              </div>
            )}
            <form onSubmit={handleSubmit} style={formStyle}>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={inputStyle}
              />
              <textarea
                className="textarea-notebook"
                placeholder="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                style={textareaStyle}
              ></textarea>
              <button type="submit" style={submitButtonStyle}>Add Diary</button>
            </form>
            <ul style={diaryListStyle}>
              {diaries.map((diary, index) => (
                <li key={index} style={diaryItemStyle}>
                  <h2 style={diaryTitleStyle}>{diary.title}</h2>
                  <p style={diaryContentStyle}>{diary.content}</p>
                  {diary.weather && (
                    <div style={weatherInDiaryStyle}>
                      <WeatherIcon iconCode={diary.weather.weather[0].icon} description={diary.weather.weather[0].description} />
                      <p>Temperature: {diary.weather.main.temp}°C</p>
                    </div>
                  )}
                  <small style={diaryDateStyle}>{new Date(diary.date).toLocaleString()}</small>
                </li>
              ))}
            </ul>
            {musicRecommendations.length > 0 && <Player token={session?.accessToken} playlist={musicRecommendations} />}
          </>
        )}
        {status !== 'authenticated' && (
          <div style={signInContainerStyle}>
            <p>Please sign in to use the diary app and Spotify player.</p>
            <button onClick={() => signIn('spotify')} style={signInButtonStyle}>Sign in with Spotify</button>
          </div>
        )}
      </main>
      <aside style={{ ...newsStyle, top: topNavBarHeight, transform: isNewsVisible ? 'translateX(0)' : 'translateX(100%)' }}>
        <button onClick={() => setIsNewsVisible(false)} style={newsCloseButtonStyle}>
          News 접기 &gt;&gt;&gt;&gt;
        </button>
        <h2>Latest News by Category</h2>
        {Object.keys(news).length > 0 ? (
          Object.keys(news).map((category) => (
            <div key={category} style={newsCategoryStyle}>
              <h3>{category}</h3>
              <ul style={newsListStyle}>
                {news[category].map((item, index) => (
                  <li key={index}>
                    <a href={item.link} target="_blank" rel="noopener noreferrer" style={newsLinkStyle}>
                      {stripHtmlTags(item.title)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p>No news available</p>
        )}
      </aside>
    </div>
  );
}

const topNavBarHeight = '80px'; // Move topNavBarHeight here to ensure it is defined before use

const containerStyle = {
  fontFamily: 'Arial, sans-serif',
  backgroundColor: '#f8f8f8',
  minHeight: '100vh',
  display: 'flex',
  padding: '0 1rem',
  position: 'relative',
};

const newsButtonStyle = {
  position: 'absolute',
  top: '1.8rem',
  right: '1rem',
  padding: '0.75rem 1rem',
  fontSize: '1rem',
  borderRadius: '4px',
  border: 'none',
  backgroundColor: '#0070f3',
  color: '#fff',
  cursor: 'pointer',
  zIndex: 10,
};

const newsCloseButtonStyle = {
  width: '70%',
  padding: '0.75rem 1rem',
  fontSize: '1rem',
  borderRadius: '4px',
  border: 'none',
  backgroundColor: '#0070f3',
  color: '#fff',
  cursor: 'pointer',
  marginBottom: '1rem',
};


const newsStyle = {
  position: 'fixed',
  right: 0,
  width: '300px',
  height: `calc(100% - ${topNavBarHeight})`, // Adjust height to account for the top navigation bar
  padding: '1rem',
  backgroundColor: '#fff',
  borderLeft: '1px solid #ccc',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  overflowY: 'auto',
  transition: 'transform 0.3s ease-in-out',
  transform: 'translateX(100%)',
  top: topNavBarHeight,
};

const newsCategoryStyle = {
  marginBottom: '1rem',
};

const newsListStyle = {
  listStyleType: 'none',
  padding: 0,
};

const newsLinkStyle = {
  textDecoration: 'none',
  color: '#000',
};

const mainStyle = {
  flex: 1,
  maxWidth: '800px',
  margin: '0 auto',
  padding: '2rem 0',
};

const headingStyle = {
  textAlign: 'center',
  color: '#333',
};

const weatherStyle = {
  textAlign: 'center',
  backgroundColor: '#fff',
  padding: '1rem',
  borderRadius: '8px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  marginBottom: '2rem',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  marginBottom: '2rem',
  backgroundColor: '#fff',
  padding: '1rem',
  borderRadius: '8px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
};

const inputStyle = {
  padding: '0.5rem',
  fontSize: '1rem',
  borderRadius: '4px',
  border: '1px solid #ccc',
};

const textareaStyle = {
  padding: '0.5rem',
  fontSize: '1rem',
  borderRadius: '4px',
  border: '1px solid #ccc',
  minHeight: '100px',
};

const submitButtonStyle = {
  padding: '0.75rem 1rem',
  fontSize: '1rem',
  borderRadius: '4px',
  border: 'none',
  backgroundColor: '#0070f3',
  color: '#fff',
  cursor: 'pointer',
};

const diaryListStyle = {
  listStyleType: 'none',
  padding: 0,
};

const diaryItemStyle = {
  backgroundColor: '#fff',
  padding: '1rem',
  borderRadius: '8px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  marginBottom: '1rem',
};

const diaryTitleStyle = {
  margin: '0 0 0.5rem 0',
  color: '#0070f3',
};

const diaryContentStyle = {
  margin: '0 0 0.5rem 0',
};

const weatherInDiaryStyle = {
  margin: '0 0 0.5rem 0',
  padding: '0.5rem',
  borderRadius: '4px',
  backgroundColor: '#f0f0f0',
};

const diaryDateStyle = {
  color: '#666',
  fontSize: '0.875rem',
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
