import { useSession, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { fetchWeather } from '../libs/weather';
import Player from '../components/Player';
import he from 'he';

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
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = fontFace1 + fontFace2;
  document.head.appendChild(styleSheet);
};

export default function Home() {
  const { data: session, status } = useSession();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [diaries, setDiaries] = useState([]);
  const [weather, setWeather] = useState(null);
  const [musicRecommendations, setMusicRecommendations] = useState([]);
  const [musicReasons, setMusicReasons] = useState([]);
  const [genres, setGenres] = useState([]);
  const [news, setNews] = useState({});
  const [isNewsVisible, setIsNewsVisible] = useState(false);
  const [expandedDiaryIndex, setExpandedDiaryIndex] = useState(null); // Track expanded diary
  const [isLoading, setIsLoading] = useState(false); // Track loading state
  const [currentPlaylist, setCurrentPlaylist] = useState([]);

  const topNavBarHeight = '80px'; // Adjust this value according to the actual height of your top navigation bar

  const WeatherIcon = ({ iconCode, description }) => {
    const iconUrl = `http://openweathermap.org/img/wn/${iconCode}.png`;
    return <img src={iconUrl} alt={description} style={weatherIconStyle} />;
  };

  const stripHtmlTags = (text) => {
    const doc = new DOMParser().parseFromString(text, 'text/html');
    return doc.body.textContent || '';
  };

  const [currentPage, setCurrentPage] = useState(1);
  const diariesPerPage = 5;

  // 현재 페이지에 해당하는 일기들을 가져옴
  const indexOfLastDiary = currentPage * diariesPerPage;
  const indexOfFirstDiary = indexOfLastDiary - diariesPerPage;

  // 페이지에 해당하는 일기들만 슬라이싱
  const currentDiaries = diaries.slice(indexOfFirstDiary, indexOfLastDiary);

  useEffect(() => {
    addFontFace(); 
    // Fetch news data
    fetch('/api/news')
      .then((response) => response.json())
      .then((data) => setNews(data))
      .catch((error) => console.error('Error fetching news:', error));

    // Fetch diary data
    fetch('/api/diary')
      .then((response) => response.json())
      .then((data) => setDiaries(data.reverse())) // 데이터를 역순으로 정렬하여 설정
      .catch((error) => console.error('Error fetching diaries:', error));

    // Fetch user genres data
    fetch('/api/user-genres')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch genres');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Fetched genres:', data.genres);
        setGenres(data.genres || []);
      })
      .catch((error) => console.error('Failed to fetch genres:', error));
  }, []);

  useEffect(() => {
    fetchWeather()
      .then(setWeather)
      .catch((error) => console.error('Failed to fetch weather data:', error));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Set loading state

    try {
      // Fetch music recommendations first
      const recommendationRes = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ diary_entry: content, genre: genres.join(', ') || 'hip-hop' }),
      });

      if (!recommendationRes.ok) {
        throw new Error('Failed to fetch music recommendations');
      }

      const recommendations = await recommendationRes.json();
      const recommendationLinks = recommendations.map((rec) => rec.spotify_link);
      setMusicReasons(recommendations.map((rec) => he.decode(rec.reason))); // Set reasons for the recommendations
      setMusicRecommendations(recommendationLinks); // Set music recommendations

      handlePlayMusic(recommendationLinks);

      // Then, create the diary entry including the music recommendations
      const res = await fetch('/api/diary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content, weather, musicRecommendations: recommendationLinks }),
      });

      if (!res.ok) {
        throw new Error('Failed to create diary entry');
      }

      const newDiary = await res.json();
      setDiaries((prevDiaries) => [newDiary, ...prevDiaries]); // Add the new diary to the list
      setTitle('');
      setContent('');
      setCurrentPage(1); // Always go to the first page when adding a new diary
    } catch (error) {
      console.error('Error submitting diary:', error);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  const handleDelete = async (index) => {
    const actualIndex = (currentPage - 1) * diariesPerPage + index;
    const diaryToDelete = diaries[actualIndex];
    const res = await fetch('/api/diary', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: diaryToDelete._id }),
    });

    if (res.ok) {
      setDiaries((prevDiaries) => prevDiaries.filter((diary) => diary._id !== diaryToDelete._id));
    } else {
      console.error('Failed to delete diary');
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const toggleDiaryExpansion = (index) => {
    setExpandedDiaryIndex(expandedDiaryIndex === index ? null : index);
  };

  const handlePlayMusic = (playlist) => {
    setCurrentPlaylist(playlist);
  };
  

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  return (
    <div style={containerStyle}>
      {!isNewsVisible && (
        <button
          onClick={() => setIsNewsVisible(true)}
          style={newsButtonStyle}
        >
          <img src="/newsw.png" alt="news" style={newsIconStyle} />
          <span style={newsTextStyle}>뉴스 보기</span>
        </button>
      )}
      {isLoading && (
        <div style={loadingContainerStyle}>
          <div style={loadingIconStyle}></div>
          <p style={loadingTextStyle}>AI가 음악을 추천 중...</p>
        </div>
      )}
        {!isLoading && currentPlaylist.length > 0 && (
          <Player token={session?.accessToken} playlist={currentPlaylist} reasons={musicReasons} />
        )}
      <main style={mainStyle}>
        {status === 'authenticated' && (
          <>
            {weather && (
              <div style={weatherStyle}>
                <WeatherIcon iconCode={weather.weather[0].icon} description={weather.weather[0].description} />
                <p>현재 온도: {Math.round(weather.main.temp)}°C</p>
              </div>
            )}
            <form onSubmit={handleSubmit} style={formStyle}>
              <input
                type="text"
                placeholder="제목을 입력하시오"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={inputStyle}
              />
              <textarea
                className="textarea-notebook"
                placeholder="내용을 입력하시오"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                style={textareaStyle}
              ></textarea>
              <button type="submit" style={submitButtonStyle}>일기 저장!</button>
            </form>
            <ul style={diaryListStyle}>
              {currentDiaries.map((diary, index) => (
                <li key={index} style={diaryItemStyle} onClick={() => toggleDiaryExpansion(index)}>
                  <div style={diaryHeaderStyle}>
                    <h2 style={diaryTitleStyle}>{diary.title}</h2>
                    <div style={buttonContainerStyle}>
                      <button onClick={(e) => { e.stopPropagation(); handlePlayMusic(diary.musicRecommendations); }} style={playButtonStyle}>
                        <img src="/play_black.png" alt="Play" style={playIconStyle} />
                      </button>                      
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(index); }} style={deleteButtonStyle}>
                        <img src="/trash.png" alt="Delete" style={trashIconStyle} />
                      </button>
                    </div>
                  </div>
                  <p className={`diary-content ${expandedDiaryIndex === index ? 'expanded' : 'collapsed'}`}>
                    {diary.content}
                  </p>
                  <div style={weatherAndMusicStyle}>
                    {diary.weather && (
                      <div style={weatherInDiaryStyle}>
                        <WeatherIcon iconCode={diary.weather.weather[0].icon} description={diary.weather.weather[0].description} />
                        <p>온도: {Math.round(diary.weather.main.temp)}°C</p>
                      </div>
                    )}
                  </div>
                  <small style={diaryDateStyle}>{new Date(diary.date).toLocaleString('default', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}</small>
                </li>
              ))}
            </ul>
            <div style={paginationStyle}>
              {[...Array(Math.ceil(diaries.length / diariesPerPage)).keys()].map((number) => (
                <button
                  key={number}
                  onClick={() => handlePageChange(number + 1)}
                  style={pageButtonStyle}
                  disabled={currentPage === number + 1}
                >
                  {number + 1}
                </button>
              ))}
            </div>
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
        <button onClick={() => setIsNewsVisible(false)} style={newsButtonStyle2}>
          <img src="/newsw.png" alt="news" style={newsIconStyle} />
          <span style={newsTextStyle}>뉴스 접기</span>
        </button>
        <h2 style={newsHeaderStyle}>최신 뉴스</h2>
        {Object.keys(news).length > 0 ? (
          Object.keys(news).map((category) => (
            <div key={category} style={newsCategoryStyle}>
              <h3>{category}</h3>
              <ul style={newsListStyle}>
                {news[category].map((item, index) => (
                  <li key={index}>
                    <a href={item.link} target="_blank" rel="noopener noreferrer" style={newsLinkStyle}>
                      • {stripHtmlTags(item.title)}
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
      <style jsx global>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .collapsed {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: normal;
          font-size: 1rem; /* Default font size for collapsed content */
          font-weight: normal; /* Default font weight for collapsed content */
          background-color: transparent; /* Default background for collapsed content */
          padding: 0; /* No padding for collapsed content */
          border-radius: 0; /* No border radius for collapsed content */
          box-shadow: none; /* No box shadow for collapsed content */
        }

        .expanded {
            display: block;
            margin-bottom: 2rem; /* Add some space to separate underline from text */
            font-size: 1rem; /* Font size for expanded content */
            font-weight: bold; /* Font weight for expanded content */
            background-color: #fff; /* Background color for expanded content */
            padding: 1rem; /* Padding for expanded content */
            border-radius: 2px; /* Border radius for expanded content */
            box-shadow: 0 0 0px rgba(0, 0, 0, 0.1); /* Box shadow for expanded content */
            line-height: 2rem; /* Increase line height to make space for the underline */
            background: linear-gradient(transparent 98%, #ccc 98%, #ccc 100%) repeat-y; /* Add underline effect */
            background-size: 100% 2rem; /* Adjust the underline size */
            background-position: 0 1rem; /* Move background down */
        }



        .diary-content {
          transition: all 0.3s ease-in-out; /* Smooth transition for styles */
        }

        .textarea-notebook {
          font-size: 1.3rem;
          font-weight: bold;
          background-color: #fff;
          padding: 1rem;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}

const TrackDetail = ({ trackId, accessToken }) => {
  const [trackDetails, setTrackDetails] = useState(null);

  useEffect(() => {
    const fetchTrackDetails = async () => {
      try {
        const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        const data = await response.json();
        setTrackDetails(data);
      } catch (error) {
        console.error('Error fetching track details:', error);
      }
    };

    fetchTrackDetails();
  }, [trackId, accessToken]);

  if (!trackDetails || !trackDetails.album || !trackDetails.album.images) {
    return <p>Loading track details...</p>;
  }

  return (
    <div style={musicItemStyle}>
      <img src={trackDetails.album.images[0].url} alt={trackDetails.name} style={musicImageStyle} />
      <p style={musicNameStyle}>{trackDetails.name}</p>
    </div>
  );
};

const topNavBarHeight = '80px'; // Ensure topNavBarHeight is defined here

const containerStyle = {
  fontFamily: 'VITROpride, Arial, sans-serif',
  backgroundSize: 'contain', // 이미지 크기를 고정
  backgroundAttachment: 'fixed', // 배경 이미지 고정
  backgroundColor: '#f8f8f8',
  backgroundImage: 'url(/serene_landscape_background.png)', // 배경 이미지 경로
  backgroundSize: 'cover', // 이미지가 화면을 덮도록 조정
  backgroundPosition: 'center', // 이미지가 중앙에 위치하도록 조정
  minHeight: '100vh',
  display: 'flex',
  padding: '0 1rem',
  position: 'relative',
};

const loadingContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'fixed',
  top: '80px', // Adjust based on your layout
  left: '120px', // Adjusted to move right
  width: '300px',
  height: '300px',
  backgroundColor: '#fff',
  border: '1px solid #ccc',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  zIndex: 1000,
};

const loadingIconStyle = {
  width: '50px',
  height: '50px',
  border: '5px solid #ccc',
  borderTop: '5px solid #0070f3',
  borderRadius: '50%',
  animation: 'spin 2s linear infinite',
};

const loadingTextStyle = {
  marginTop: '10px',
  fontSize: '1rem',
  color: '#0070f3',
};

const musicReasonsStyle = {
  marginTop: '1rem',
};

const newsButtonStyle = {
  background: '#0070f3', // 파란색 배경
  border: 'none',
  cursor: 'pointer',

  margin: '0',
  zIndex: 10,
  position: 'absolute',
  top: '1.8rem',
  right: '2rem',
  display: 'flex', // 플렉스박스 사용
  alignItems: 'center',
  borderRadius: '4px', // 모서리 둥글게
};
const newsButtonStyle2 = {
  background: '#0070f3', // 파란색 배경
  border: 'none',
  cursor: 'pointer',

  margin: '0',
  zIndex: 10,
  position: 'absolute',
  top: '1.8rem',
  right: '1rem',
  display: 'flex', // 플렉스박스 사용
  alignItems: 'center',
  borderRadius: '4px', // 모서리 둥글게
};

const newsIconStyle = {
  width: '30px', // 크기 조정
  height: '30px',
  marginRight: '0.5rem', // 아이콘과 텍스트 사이의 여백
};

const newsTextStyle = {
  fontSize: '1.2rem',
  color: '#fff',
  fontFamily: 'VITROpride,Arial, sans-serif', // 글꼴 적용
  fontWeight: 'Bold'
};
const newsHeaderStyle = {
  fontFamily: 'VITRO, Arial, sans-serif',
  marginBottom: '1rem', // 제목과 버튼 사이의 여백
};

const newsStyle = {
  position: 'fixed',
  right: 0,
  top: 0, 
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
  position: 'fixed', // 화면 상단에 고정
  top: 0,
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
  fontFamily: 'VITROpride, Arial, sans-serif',
  fontWeight: 'Bold',
  padding: '0.5rem',
  fontSize: '1rem',
  borderRadius: '4px',
  border: '1px solid #ccc',
};

const textareaStyle = {
  fontFamily: 'VITROpride, Arial, sans-serif',
  padding: '0.5rem',
  fontSize: '1rem',
  borderRadius: '4px',
  border: '1px solid #ccc',
  minHeight: '100px',
};

const submitButtonStyle = {
  fontFamily: 'VITROpride, Arial, sans-serif',
  fontWeight: 'Bold',
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
  cursor: 'pointer',
};

const diaryHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const diaryTitleStyle = {
  fontFamily: 'VITRO, Arial, sans-serif',
  margin: '0 0 0.5rem 0',
  color: '#0070f3',
};

const diaryContentStyle = {
  margin: '0 0 0.5rem 0',
  flex: '1',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 3, // Number of lines to show before truncating
  whiteSpace: 'normal',
  fontSize: '1.2rem',
  fontWeight: 'bold',
};

const weatherAndMusicStyle = {
  fontWeight: 'bold',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const weatherInDiaryStyle = {
  margin: '0 0 0.5rem 0',
  padding: '0.5rem',
  borderRadius: '4px',
  backgroundColor: '#f0f0f0',
  display: 'flex',
};

const weatherIconStyle = {
  width: '50px', // Adjust the size as needed
  height: '50px', // Adjust the size as needed
};

const musicContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const musicItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  backgroundColor: '#f8f8f8',
  padding: '0.5rem',
  borderRadius: '4px',
};

const musicImageStyle = {
  width: '50px',
  height: '50px',
  borderRadius: '4px',
};

const musicNameStyle = {
  margin: 0,
  fontSize: '1rem',
  color: '#333',
};

const diaryDateStyle = {
  color: '#666',
  fontSize: '0.875rem',
};

const buttonContainerStyle = {
  display: 'flex',
  alignItems: 'center',
};

const deleteButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
};

const playButtonStyle = {
  
  background: 'none',
  border: 'none',
  cursor: 'pointer',
};

const trashIconStyle = {
  width: '20px',
  height: '20px',
};
const playIconStyle = {
  width: '20px',
  height: '20px',
};
const paginationStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '1rem',
  marginTop: '2rem',
};

const pageButtonStyle = {
  padding: '0.5rem 1rem',
  fontSize: '1rem',
  borderRadius: '4px',
  border: 'none',
  backgroundColor: '#0070f3',
  color: '#fff',
  cursor: 'pointer',
};

const pageNumberStyle = {
  fontSize: '1rem',
  color: '#333',
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

const mainStyle = {
  flex: 1,
  maxWidth: '800px',
  margin: '0 auto',
  padding: '2rem 0',
};

const headingStyle = {
  textAlign: 'center',
  color: '#000',
  fontFamily: 'VITRO, Arial, sans-serif'
};

const weatherStyle = {
  fontFamily: 'VITROpride, Arial, sans-serif',
  fontWeight: 'bold',
  textAlign: 'center',
  backgroundColor: '#fff',
  padding: '1rem',
  borderRadius: '8px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  marginBottom: '2rem',
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
