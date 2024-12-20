
import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Play } from 'lucide-react';

export function PSXEmulator() {
  const [romFile, setRomFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.iso') || file.name.endsWith('.bin')) {
      setRomFile(file);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.name.endsWith('.iso') || file.name.endsWith('.bin'))) {
      setRomFile(file);
    }
  };

  const handlePlay = () => {
    if (romFile) {
      // Initialize PSX emulator with ROM
      console.log('Playing PSX ROM:', romFile.name);
    }
  };

  return (
    <Card 
      className="h-full p-4"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <h2 className="text-xl mb-4">PlayStation Emulator</h2>
      <div className="flex flex-col items-center gap-4">
        <div className="text-center text-muted-foreground">
          {romFile ? `Loaded: ${romFile.name}` : 'Drop .iso/.bin ROM file to play'}
        </div>
        <input
          type="file"
          accept=".iso,.bin"
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
            Upload ROM
          </Button>
          {romFile && (
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
