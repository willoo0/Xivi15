
import { useEffect, useState } from "react";

export function Splash({ onFinish }: { onFinish: () => void }) {
  const [opacity, setOpacity] = useState(1);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({
      x: (e.clientX / window.innerWidth) * 20,
      y: (e.clientY / window.innerHeight) * 20
    });
  };

  const handleClick = () => {
    document.documentElement.requestFullscreen().catch((err) => {
      console.warn("Could not enter fullscreen:", err);
    });
    setOpacity(0);
    setTimeout(onFinish, 500);
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-zinc-950 cursor-pointer overflow-hidden backdrop-blur-xl"
      style={{
        opacity,
        transition: "opacity 0.3s ease-in-out",
      }}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
    >
      {/* Stars */}
      {Array.from({ length: 200 }).map((_, i) => (
        <div
          key={i}
          className="absolute bg-white rounded-full"
          style={{
            width: Math.random() * 2 + 1 + "px",
            height: Math.random() * 2 + 1 + "px",
            top: Math.random() * 100 + "%",
            left: Math.random() * 100 + "%",
            animation: `starMove ${Math.random() * 3 + 2}s linear infinite`,
            transform: `translateX(${mousePosition.x}px) translateY(${mousePosition.y}px)`,
            transition: "transform 0.1s ease-out",
          }}
        />
      ))}

      <div className="text-center space-y-6 relative z-10 backdrop-blur-sm bg-black/30 p-8 rounded-xl">
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
          @keyframes starMove {
            from {
              transform: translateZ(0) translateX(${mousePosition.x}px) translateY(${mousePosition.y}px);
            }
            to {
              transform: translateZ(400px) translateX(${mousePosition.x}px) translateY(${mousePosition.y}px);
            }
          }
        `}
      </style>
    </div>
  );
}
