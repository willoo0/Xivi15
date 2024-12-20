
import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

export function NESEmulator() {
  const [romFile, setRomFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.nes')) {
      setRomFile(file);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.nes')) {
      setRomFile(file);
    }
  };

  return (
    <Card 
      className="h-full p-4"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <h2 className="text-xl mb-4">NES Emulator</h2>
      <div className="flex flex-col items-center gap-4">
        <div className="text-center text-muted-foreground">
          {romFile ? `Loaded: ${romFile.name}` : 'Drop .nes ROM file to play'}
        </div>
        <input
          type="file"
          accept=".nes"
          className="hidden"
          ref={fileInputRef}
          onChange={handleUpload}
        />
        <Button 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload ROM
        </Button>
      </div>
    </Card>
  );
}
