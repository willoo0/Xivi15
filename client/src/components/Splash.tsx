import { useEffect, useState } from "react";

export function Splash({ onFinish }: { onFinish: () => void }) {
  const [opacity, setOpacity] = useState(1);

  const handleClick = () => {
    document.documentElement.requestFullscreen().catch((err) => {
      console.warn("Could not enter fullscreen:", err);
    });
    setOpacity(0);
    setTimeout(onFinish, 500);
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-zinc-950 cursor-pointer"
      style={{
        opacity,
        transition: "opacity 0.3s ease-in-out",
      }}
      onClick={handleClick}
    >
      <div className="text-center space-y-6">
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
    </div>
  );
}
