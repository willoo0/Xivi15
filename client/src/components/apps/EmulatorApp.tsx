
import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Play } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function EmulatorApp() {
  const [gameFile, setGameFile] = useState<File | null>(null);
  const [system, setSystem] = useState<string>('nes');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const systemExtensions: { [key: string]: string[] } = {
    nes: ['.nes'],
    snes: ['.smc', '.sfc'],
    n64: ['.n64', '.z64'],
    gba: ['.gba'],
    psx: ['.iso', '.bin'],
    sega: ['.md', '.gen'],
    dos: ['.exe', '.com']
  };

  const systemNames: { [key: string]: string } = {
    nes: 'Nintendo (NES)',
    snes: 'Super Nintendo',
    n64: 'Nintendo 64',
    gba: 'Game Boy Advance',
    psx: 'PlayStation',
    sega: 'Sega Genesis',
    dos: 'DOS'
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    const validExtensions = systemExtensions[system];
    if (file && validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
      setGameFile(file);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const validExtensions = systemExtensions[system];
    if (file && validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
      setGameFile(file);
    }
  };

  const handlePlay = async () => {
    if (!gameFile) return;
    
    // Create object URL for the ROM file
    const gameUrl = URL.createObjectURL(gameFile);
    
    try {
      // Initialize appropriate emulator based on system
      // This is where you'd integrate with actual emulator cores
      console.log(`Playing ${system.toUpperCase()} game:`, gameFile.name);
      console.log('Game URL:', gameUrl);
    } catch (error) {
      console.error('Error loading game:', error);
    }
  };

  return (
    <Card 
      className="h-full p-4"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <h2 className="text-xl mb-4">Game Console Emulator</h2>
      <div className="flex flex-col items-center gap-4">
        <Select value={system} onValueChange={setSystem}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select system" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(systemNames).map(([key, name]) => (
              <SelectItem key={key} value={key}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="text-center text-muted-foreground">
          {gameFile ? `Loaded: ${gameFile.name}` : `Drop ${systemExtensions[system].join('/')} ROM file to play`}
        </div>
        
        <input
          type="file"
          accept={systemExtensions[system].join(',')}
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
