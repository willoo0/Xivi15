
import { useState } from 'react';
import { Input } from '../ui/input';

export function PhotoViewer() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      <Input type="file" accept="image/*" onChange={onFileChange} />
      {imageUrl && (
        <div className="flex-1 overflow-auto flex items-center justify-center">
          <img 
            src={imageUrl} 
            alt="Uploaded" 
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
