
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

type Position = { x: number; y: number };

export function Snake() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<string>('right');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const moveSnake = () => {
    const newSnake = [...snake];
    const head = { ...newSnake[0] };

    switch (direction) {
      case 'up': head.y -= 1; break;
      case 'down': head.y += 1; break;
      case 'left': head.x -= 1; break;
      case 'right': head.x += 1; break;
    }

    // Check collision with walls
    if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
      setGameOver(true);
      return;
    }

    // Check collision with self
    if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
      setGameOver(true);
      return;
    }

    newSnake.unshift(head);

    // Check if snake ate food
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

  const handleKeyPress = (e: KeyboardEvent) => {
    e.preventDefault();
    switch (e.key) {
      case 'ArrowUp': if (direction !== 'down') setDirection('up'); break;
      case 'ArrowDown': if (direction !== 'up') setDirection('down'); break;
      case 'ArrowLeft': if (direction !== 'right') setDirection('left'); break;
      case 'ArrowRight': if (direction !== 'left') setDirection('right'); break;
    }
  };

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 5, y: 5 });
    setDirection('right');
    setGameOver(false);
    setScore(0);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 400, 400);

    // Draw snake
    ctx.fillStyle = 'lime';
    snake.forEach(({ x, y }) => {
      ctx.fillRect(x * 20, y * 20, 18, 18);
    });

    // Draw food
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * 20, food.y * 20, 18, 18);
  }, [snake, food]);

  useEffect(() => {
    if (!gameOver) {
      const interval = setInterval(moveSnake, 100);
      window.addEventListener('keydown', handleKeyPress);
      return () => {
        clearInterval(interval);
        window.removeEventListener('keydown', handleKeyPress);
      };
    }
  }, [snake, direction, gameOver]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex justify-between w-full">
        <h2 className="text-xl font-bold">Snake Game</h2>
        <span className="text-xl">Score: {score}</span>
      </div>
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="border border-gray-400"
      />
      {gameOver && (
        <div className="text-center">
          <h3 className="text-xl text-red-500 mb-2">Game Over!</h3>
          <Button onClick={resetGame}>Play Again</Button>
        </div>
      )}
    </div>
  );
}
