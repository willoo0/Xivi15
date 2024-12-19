
import { useEffect, useState } from "react";

export function Splash({ onFinish }: { onFinish: () => void }) {
  const [opacity, setOpacity] = useState(1);
  const [rocketPosition, setRocketPosition] = useState(-100);

  useEffect(() => {
    setRocketPosition(window.innerWidth / 2 - 50);
  }, []);

  const handleClick = () => {
    document.documentElement.requestFullscreen().catch((err) => {
      console.warn("Could not enter fullscreen:", err);
    });
    setOpacity(0);
    setTimeout(onFinish, 500);
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-zinc-950 cursor-pointer overflow-hidden"
      style={{
        opacity,
        transition: "opacity 0.3s ease-in-out",
      }}
      onClick={handleClick}
    >
      {/* Stars */}
      {Array.from({ length: 100 }).map((_, i) => (
        <div
          key={i}
          className="absolute bg-white rounded-full"
          style={{
            width: Math.random() * 3 + "px",
            height: Math.random() * 3 + "px",
            top: Math.random() * 100 + "%",
            left: Math.random() * 100 + "%",
            animation: `twinkle ${Math.random() * 3 + 1}s infinite`,
          }}
        />
      ))}
      
      {/* Rocket */}
      <div
        className="absolute"
        style={{
          transform: `translateX(${rocketPosition}px)`,
          animation: "rocketFly 2s ease-out forwards",
        }}
      >
        <div className="w-20 h-32 relative">
          <div className="absolute inset-0 bg-red-500 rounded-t-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-orange-500 animate-pulse" style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }} />
        </div>
      </div>

      <div className="text-center space-y-6 relative z-10">
        <h1
          className="text-4xl font-bold text-white"
          style={{
            animation: "fadeIn 0.5s ease-out",
            opacity: opacity,
          }}
        >
          Xivi 15 Alpha
        </h1>
        <p className="text-zinc-400">You are first in Queue!</p>
        <p className="text-zinc-400">Click anywhere to continue</p>
        <div
          className="w-8 h-8 border-2 border-zinc-600 border-t-transparent rounded-full mx-auto"
          style={{
            animation: "spin 1.2s linear infinite",
            opacity: opacity * 0.5,
          }}
        />
      </div>

      <style>
        {`
          @keyframes twinkle {
            0% { opacity: 0.2; }
            50% { opacity: 1; }
            100% { opacity: 0.2; }
          }
          @keyframes rocketFly {
            0% { transform: translateY(100vh) translateX(-50vw) rotate(45deg); }
            100% { transform: translateY(-20vh) translateX(50vw) rotate(45deg); }
          }
        `}
      </style>
    </div>
  );
}
