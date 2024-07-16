const apiKey = "53b6b263913b847e4c2ee13f55a4b2e8"; // 발급받은 API 키를 여기에 입력합니다.

export const fetchWeather = async () => {
  const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Seoul&appid=${apiKey}&units=metric`);
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }
  const data = await response.json();
  return data;
};
