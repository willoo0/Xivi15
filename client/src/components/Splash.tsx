
import { useEffect, useState } from 'react';

export function Splash({ onFinish }: { onFinish: () => void }) {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(0);
      setTimeout(onFinish, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-background"
      style={{ 
        opacity, 
        transition: 'opacity 0.5s ease-in-out'
      }}
    >
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold animate-bounce">BrowserOS</h1>
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );
}
