
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import axios from 'axios';

export function Weather() {
  const [forecast, setForecast] = useState<any>(null);
  const [error, setError] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getWeather = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Get location from IP
        const ipRes = await axios.get('https://ipapi.co/json/');
        const { city, latitude: lat, longitude: lon } = ipRes.data;
        setLocation(`${city}`);

        const API_KEY = process.env.OPENWEATHER_API_KEY;
        if (!API_KEY) {
          throw new Error('OpenWeather API key not configured');
        }

        const weatherRes = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );

        const dailyData = weatherRes.data.list.reduce((days: any, item: any) => {
          const date = new Date(item.dt * 1000).toLocaleDateString();
          if (!days[date]) {
            days[date] = item;
          }
          return days;
        }, {});

        setForecast(Object.values(dailyData).slice(0, 7));
      } catch (err: any) {
        setError(err.message || 'Failed to fetch weather data');
        console.error('Weather error:', err);
      } finally {
        setLoading(false);
      }
    };

    getWeather();
  }, []);

  if (loading) {
    return <div className="p-4">Loading weather data...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      {location && <h2 className="text-2xl font-bold">Weather for {location}</h2>}
      {error && <div className="text-red-500 p-2 bg-red-50 rounded">{error}</div>}

      {forecast && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forecast.map((day: any) => (
            <Card key={day.dt} className="p-4">
              <div className="font-bold">
                {new Date(day.dt * 1000).toLocaleDateString()}
              </div>
              <div className="text-2xl">
                {Math.round(day.main.temp)}°C
              </div>
              <div>{day.weather[0].main}</div>
              <div>Humidity: {day.main.humidity}%</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
