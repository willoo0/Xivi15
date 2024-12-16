
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import axios from 'axios';
import { Command, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function Weather() {
  const [location, setLocation] = useState('');
  const [forecast, setForecast] = useState<any>(null);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const searchLocations = async (query: string) => {
    if (query.length < 3) return;
    try {
      const API_KEY = process.env.OPENWEATHER_API_KEY;
      const res = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`);
      setSuggestions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getWeather = async (lat: number, lon: number, name: string) => {
    try {
      const API_KEY = process.env.OPENWEATHER_API_KEY;
      const weatherRes = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
      
      const dailyData = weatherRes.data.list.reduce((days: any, item: any) => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!days[date]) {
          days[date] = item;
        }
        return days;
      }, {});

      setForecast(Object.values(dailyData).slice(0, 7));
      setLocation(name);
      setError('');
      setOpen(false);
    } catch (err) {
      setError('Failed to fetch weather data');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            {location || "Search for a location..."}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" style={{ width: '350px' }}>
          <Command>
            <CommandInput 
              placeholder="Search location..." 
              value={location}
              onValueChange={(value) => {
                setLocation(value);
                searchLocations(value);
              }}
            />
            <CommandGroup>
              {suggestions.map((item) => (
                <CommandItem
                  key={item.lat + item.lon}
                  onSelect={() => getWeather(item.lat, item.lon, `${item.name}, ${item.country}`)}
                >
                  {item.name}, {item.state && `${item.state},`} {item.country}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

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
