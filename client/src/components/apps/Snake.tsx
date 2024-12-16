
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export function Snake() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<{ x: number; y: number }>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<string>('right');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);

  // Game logic remains the same...
  const moveSnake = () => {
    const newSnake = [...snake];
    const head = { ...newSnake[0] };

    switch (direction) {
      case 'up': head.y -= 1; break;
      case 'down': head.y += 1; break;
      case 'left': head.x -= 1; break;
      case 'right': head.x += 1; break;
    }

    if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
      setGameOver(true);
      setIsPlaying(false);
      return;
    }

    if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
      setGameOver(true);
      setIsPlaying(false);
      return;
    }

    newSnake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      setScore(score + 1);
      setFood({
        x: Math.floor(Math.random() * 20),
        y: Math.floor(Math.random() * 20)
      });
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  };

  // Rest of the game logic remains the same...

  return (
    <div className="game-container">
      <div className="game-header">
        <h2 className="game-title">Snake</h2>
        <span className="game-score">Score: {score}</span>
      </div>
      
      <div className="flex items-center gap-4 w-full max-w-md mb-4">
        <span className="text-sm font-medium">Speed:</span>
        <Slider
          value={[speed]}
          onValueChange={(value) => setSpeed(200 - value[0])}
          min={20}
          max={180}
          step={10}
          className="flex-1"
          disabled={isPlaying}
        />
      </div>

      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="border border-primary rounded-lg shadow-lg"
      />

      <div className="game-controls">
        {(!isPlaying || gameOver) && (
          <Button 
            onClick={startGame}
            className="w-32"
            variant="default"
          >
            {gameOver ? 'Play Again' : 'Start Game'}
          </Button>
        )}
      </div>

      {gameOver && (
        <div className="text-xl font-bold text-destructive mt-4">
          Game Over!
        </div>
      )}
    </div>
  );
}
