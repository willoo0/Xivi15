
import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Play } from 'lucide-react';

export function EmulatorApp() {
  const [gameFile, setGameFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emulatorRef = useRef<HTMLDivElement>(null);
  const dosPlayerRef = useRef<any>(null);

  useEffect(() => {
    // Clean up on unmount
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

      // Load js-dos dynamically
      const Dos = (await import('js-dos')).default;
      const dos = Dos(canvas, {
        wdosboxUrl: "https://js-dos.com/6.22/current/wdosbox.js"
      });
      
      // Load game file
      const buffer = await gameFile.arrayBuffer();
      await dos.createZip(buffer);
      
      dosPlayerRef.current = dos;
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
      <h2 className="text-xl mb-4">DOS Emulator</h2>
      <div className="flex flex-col items-center gap-4">
        <div className="text-center text-muted-foreground">
          {gameFile ? `Loaded: ${gameFile.name}` : 'Drop DOS game file to play'}
        </div>
        
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleUpload}
          accept=".exe,.com,.bat,.zip"
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
        
        <div 
          ref={emulatorRef}
          className="w-full aspect-video bg-black/10 rounded-lg overflow-hidden"
        />
      </div>
    </Card>
  );
}
