
import { useState, useEffect } from 'react';
import { Search, Play, Pause } from 'lucide-react';
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
    if (!query.trim()) return;
    
    try {
      const response = await fetch(`/api/music/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSongs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error searching songs:', error);
      setSongs([]);
    }
  };

  const playSong = async (song: any) => {
    if (currentSong?.videoId === song.videoId) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
      return;
    }

    try {
      const response = await fetch(`/api/music/stream?videoId=${song.videoId}`);
      if (!response.ok) throw new Error('Failed to get stream URL');
      
      const data = await response.json();
      audio.src = data.url;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
        setCurrentSong(song);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing song:', error);
    }
  };

  useEffect(() => {
    const handleEnded = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
    };
  }, [audio]);

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
            key={song.videoId}
            className="p-3 mb-2 cursor-pointer hover:bg-accent"
            onClick={() => playSong(song)}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{song.title}</div>
                <div className="text-sm text-muted-foreground">{song.artist}</div>
              </div>
              {currentSong?.videoId === song.videoId && (
                <div>{isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {currentSong && (
        <Card className="p-3 mt-auto">
          <div className="font-medium">{currentSong.title}</div>
          <div className="text-sm text-muted-foreground">{currentSong.artist}</div>
          <div className="flex justify-center gap-4 mt-2">
            <Button variant="ghost" size="icon" onClick={() => playSong(currentSong)}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
