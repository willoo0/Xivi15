
import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Play } from 'lucide-react';

export function DOSEmulator() {
  const [gameFile, setGameFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.exe') || file.name.endsWith('.com'))) {
      setGameFile(file);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.name.endsWith('.exe') || file.name.endsWith('.com'))) {
      setGameFile(file);
    }
  };

  const handlePlay = () => {
    if (gameFile) {
      // Initialize DOS emulator with game
      console.log('Playing DOS game:', gameFile.name);
    }
  };

  return (
    <Card 
      className="h-full p-4"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <h2 className="text-xl mb-4">DOS Emulator</h2>
      <div className="flex flex-col items-center gap-4">
        <div className="text-center text-muted-foreground">
          {gameFile ? `Loaded: ${gameFile.name}` : 'Drop .exe/.com file to play'}
        </div>
        <input
          type="file"
          accept=".exe,.com"
          className="hidden"
          ref={fileInputRef}
          onChange={handleUpload}
        />
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Game
          </Button>
          {gameFile && (
            <Button 
              variant="default"
              onClick={handlePlay}
            >
              <Play className="w-4 h-4 mr-2" />
              Play Game
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
