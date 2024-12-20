
import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Play } from 'lucide-react';
import type { DosPlayer } from 'js-dos';

export function EmulatorApp() {
  const [gameFile, setGameFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emulatorRef = useRef<HTMLDivElement>(null);
  const dosPlayerRef = useRef<DosPlayer | null>(null);

  useEffect(() => {
    return () => {
      if (dosPlayerRef.current) {
        dosPlayerRef.current.exit();
      }
    };
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setGameFile(file);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGameFile(file);
    }
  };

  const handlePlay = async () => {
    if (!gameFile || !emulatorRef.current) return;
    
    try {
      // Clear previous emulator
      emulatorRef.current.innerHTML = '';
      
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      emulatorRef.current.appendChild(canvas);

      // Initialize js-dos
      const { DosFactory } = await import('js-dos');
      const dosFactory = DosFactory();
      const ci = await dosFactory(canvas, {
        wdosboxUrl: "/wdosbox.js"
      });
      
      // Load game file
      const buffer = await gameFile.arrayBuffer();
      await ci.loadFile(gameFile.name, new Uint8Array(buffer));
      await ci.run();
      
      dosPlayerRef.current = ci;
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
      <h2 className="text-xl mb-4">Game Emulator</h2>
      <div className="flex flex-col items-center gap-4">
        <div className="text-center text-muted-foreground">
          {gameFile ? `Loaded: ${gameFile.name}` : 'Drop ROM file to play'}
        </div>
        
        <input
          type="file"
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
        
        <div 
          ref={emulatorRef}
          className="w-full aspect-video bg-black/10 rounded-lg overflow-hidden"
        />
      </div>
    </Card>
  );
}
