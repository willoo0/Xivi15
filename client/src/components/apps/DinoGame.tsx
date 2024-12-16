
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

const GRAVITY = 0.8;
const JUMP_FORCE = -12;
const GROUND_Y = 200;
const OBSTACLE_SPEED = 5;

export function DinoGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [dinoY, setDinoY] = useState(GROUND_Y);
  const [dinoVelocity, setDinoVelocity] = useState(0);
  const [obstacles, setObstacles] = useState<number[]>([]);
  
  const jump = useCallback(() => {
    if (dinoY === GROUND_Y) {
      setDinoVelocity(JUMP_FORCE);
    }
  }, [dinoY]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === "Space" || e.code === "ArrowUp") {
      e.preventDefault();
      if (!gameStarted) {
        setGameStarted(true);
      } else {
        jump();
      }
    }
  }, [gameStarted, jump]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = setInterval(() => {
      // Update dino position
      setDinoY(y => {
        const newY = y + dinoVelocity;
        return Math.min(Math.max(newY, 0), GROUND_Y);
      });
      setDinoVelocity(v => {
        const newV = v + GRAVITY;
        return dinoY >= GROUND_Y ? 0 : newV;
      });

      // Update obstacles
      setObstacles(prev => {
        let newObstacles = prev.map(x => x - OBSTACLE_SPEED);
        if (newObstacles.length === 0 || newObstacles[newObstacles.length - 1] < 400) {
          newObstacles.push(800);
        }
        newObstacles = newObstacles.filter(x => x > -50);
        return newObstacles;
      });

      // Check collisions
      obstacles.forEach(obstacleX => {
        if (
          obstacleX > 50 && obstacleX < 100 &&
          dinoY > GROUND_Y - 40
        ) {
          setGameOver(true);
        }
      });

      // Update score
      setScore(s => s + 1);
    }, 1000/60);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, dinoY, dinoVelocity, obstacles]);

  const restartGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setDinoY(GROUND_Y);
    setDinoVelocity(0);
    setObstacles([]);
  };

  return (
    <div className="p-4 select-none" tabIndex={0}>
      <div className="mb-4 flex justify-between items-center">
        <div>Score: {score}</div>
        <Button onClick={restartGame}>New Game</Button>
      </div>
      
      <div className="relative w-[800px] h-[300px] border-b-2 border-gray-400">
        {/* Dino */}
        <div
          className="absolute w-10 h-10 bg-black"
          style={{ 
            bottom: `${300 - dinoY}px`,
            left: '50px'
          }}
        />
        
        {/* Obstacles */}
        {obstacles.map((x, i) => (
          <div
            key={i}
            className="absolute w-6 h-10 bg-red-500"
            style={{
              bottom: '0px',
              left: `${x}px`
            }}
          />
        ))}
        
        {!gameStarted && (
          <div className="absolute inset-0 flex items-center justify-center">
            Press Space to Start
          </div>
        )}
        
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
            Game Over!
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-muted-foreground">
        Controls:<br />
        Space/Up Arrow - Jump
      </div>
    </div>
  );
}
