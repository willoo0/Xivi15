
import { useState } from 'react';
import { Search, Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function MusicPlayer() {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState<any[]>([]);
  const [currentSong, setCurrentSong] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio());

  const searchSongs = async () => {
    try {
      const response = await fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=2d8ca50c&format=json&limit=10&search=${query}`);
      const data = await response.json();
      setSongs(data.results);
    } catch (error) {
      console.error('Error searching songs:', error);
    }
  };

  const playSong = (song: any) => {
    if (currentSong?.id === song.id) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    } else {
      audio.src = song.audio;
      audio.play();
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  return (
    <div className="p-4 h-full flex flex-col gap-4">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Search for songs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchSongs()}
        />
        <Button onClick={searchSongs}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        {songs.map((song) => (
          <Card
            key={song.id}
            className="p-3 mb-2 cursor-pointer hover:bg-accent flex justify-between items-center"
            onClick={() => playSong(song)}
          >
            <div>
              <div className="font-medium">{song.name}</div>
              <div className="text-sm text-muted-foreground">{song.artist_name}</div>
            </div>
            {currentSong?.id === song.id && (
              <div>{isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</div>
            )}
          </Card>
        ))}
      </div>

      {currentSong && (
        <Card className="p-3">
          <div className="font-medium">{currentSong.name}</div>
          <div className="text-sm text-muted-foreground">{currentSong.artist_name}</div>
          <div className="flex justify-center gap-4 mt-2">
            <Button variant="ghost" size="icon">
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => playSong(currentSong)}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon">
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
