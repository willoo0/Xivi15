
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
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-zinc-950"
      style={{ 
        opacity, 
        transition: 'opacity 0.3s ease-in-out'
      }}
    >
      <div className="text-center space-y-4">
        <h1 
          className="text-4xl font-bold text-white"
          style={{
            animation: 'fadeIn 0.5s ease-out',
            opacity: opacity
          }}
        >
          BrowserOS
        </h1>
        <div 
          className="w-10 h-10 border-3 border-zinc-400 border-t-transparent rounded-full mx-auto"
          style={{
            animation: 'spin 1s linear infinite',
            opacity: opacity * 0.7
          }}
        />
      </div>
    </div>
  );
}
