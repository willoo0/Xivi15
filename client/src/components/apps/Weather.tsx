
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import axios from 'axios';

export function Weather() {
  const [location, setLocation] = useState('');
  const [forecast, setForecast] = useState<any>(null);
  const [error, setError] = useState('');

  const getWeather = async () => {
    try {
      const API_KEY = process.env.OPENWEATHER_API_KEY;
      const geocodeRes = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${API_KEY}`);
      
      if (geocodeRes.data.length === 0) {
        setError('Location not found');
        return;
      }

      const { lat, lon } = geocodeRes.data[0];
      const weatherRes = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
      
      // Group forecast data by day
      const dailyData = weatherRes.data.list.reduce((days: any, item: any) => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!days[date]) {
          days[date] = item;
        }
        return days;
      }, {});

      setForecast(Object.values(dailyData).slice(0, 7));
      setError('');
    } catch (err) {
      setError('Failed to fetch weather data');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2">
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter location"
          onKeyPress={(e) => e.key === 'Enter' && getWeather()}
        />
        <Button onClick={getWeather}>Get Weather</Button>
      </div>

      {error && <div className="text-red-500">{error}</div>}

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
