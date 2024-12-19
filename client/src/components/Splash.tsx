
import { useEffect, useRef } from "react";

export function Splash({ onFinish }: { onFinish: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const speed = useRef(0.5);

  class Star {
    x: number;
    y: number;
    z: number;
    size: number;
    speed: number;
    opacity: number;

    constructor(width: number, height: number) {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.z = Math.random() * width;
      this.size = 0.5 + Math.random();
      this.speed = 0.2 + Math.random() * 0.5;
      this.opacity = 0.5 + Math.random() * 0.5;
    }

    move(width: number, height: number) {
      this.z = this.z - this.speed * speed.current;
      if (this.z <= 0) {
        this.z = width;
        this.x = Math.random() * width;
        this.y = Math.random() * height;
      }
    }

    show(ctx: CanvasRenderingContext2D, width: number, height: number) {
      let x = (this.x - width/2) * (width/this.z);
      x = x + width/2;
      
      let y = (this.y - height/2) * (width/this.z);
      y = y + height/2;
      
      const s = this.size * (width/this.z);
      
      x += (mouseX.current - width/2) * this.speed * 0.1;
      y += (mouseY.current - height/2) * this.speed * 0.1;

      const fadeInOpacity = Math.max(0, Math.min(1, (width - this.z) / 100));
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * fadeInOpacity})`;
      ctx.arc(x, y, s, 0, 2 * Math.PI);
      ctx.filter = 'blur(1px)';
      ctx.fill();
      ctx.filter = 'none';
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const stars: Star[] = [];
    const numStars = 200;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    for(let i = 0; i < numStars; i++) {
      stars.push(new Star(canvas.width, canvas.height));
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.current = e.clientX;
      mouseY.current = e.clientY;
      speed.current = 0.5 + (Math.abs(e.movementX) + Math.abs(e.movementY)) * 0.01;
    };

    document.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.7)';
      ctx.filter = 'blur(80px)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.filter = 'none';
      
      stars.forEach(star => {
        star.move(canvas.width, canvas.height);
        star.show(ctx, canvas.width, canvas.height);
      });
      
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleClick = () => {
    document.documentElement.requestFullscreen().catch(console.warn);
    setTimeout(onFinish, 500);
  };

  return (
    <div className="fixed inset-0 z-[99999] cursor-pointer overflow-hidden bg-zinc-950" onClick={handleClick}>
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="text-center space-y-6 backdrop-blur-sm bg-black/30 p-8 rounded-xl">
          <h1 className="text-4xl font-bold text-white">Xivi 15 Alpha</h1>
          <p className="text-zinc-400">You are first in Queue!</p>
          <p className="text-zinc-400">Click anywhere to continue</p>
          <div className="w-8 h-8 border-2 border-zinc-600 border-t-transparent rounded-full mx-auto animate-spin" />
        </div>
      </div>
    </div>
  );
}
