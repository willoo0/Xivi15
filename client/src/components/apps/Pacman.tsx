
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

const CELL_SIZE = 20;
const GRID_WIDTH = 20;
const GRID_HEIGHT = 15;

type Position = { x: number; y: number };
type Direction = 'up' | 'down' | 'left' | 'right';

export function Pacman() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pacman, setPacman] = useState<Position>({ x: 1, y: 1 });
  const [ghosts, setGhosts] = useState<Position[]>([
    { x: 18, y: 1 },
    { x: 18, y: 13 }
  ]);
  const [pellets, setPellets] = useState<Position[]>([]);
  const [direction, setDirection] = useState<Direction>('right');

  const maze = [
    '####################',
    '#..................#',
    '#.##.###..###.##..#',
    '#.#..............#.#',
    '#.#.##.####.##.#..#',
    '#....#......#.....#',
    '#.##.#.####.#.##..#',
    '#....#......#.....#',
    '#.#.##.####.##.#..#',
    '#.#..............#.#',
    '#.##.###..###.##..#',
    '#..................#',
    '#.##.###..###.##..#',
    '#..................#',
    '####################'
  ];

  const initGame = () => {
    const newPellets: Position[] = [];
    maze.forEach((row, y) => {
      row.split('').forEach((cell, x) => {
        if (cell === '.') {
          newPellets.push({ x, y });
        }
      });
    });
    setPellets(newPellets);
    setPacman({ x: 1, y: 1 });
    setGhosts([{ x: 18, y: 1 }, { x: 18, y: 13 }]);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    setDirection('right');
  };

  const moveGhosts = () => {
    setGhosts(prevGhosts => 
      prevGhosts.map(ghost => {
        const possibleMoves = [
          { x: ghost.x - 1, y: ghost.y },
          { x: ghost.x + 1, y: ghost.y },
          { x: ghost.x, y: ghost.y - 1 },
          { x: ghost.x, y: ghost.y + 1 }
        ].filter(pos => 
          maze[pos.y]?.[pos.x] !== '#'
        );

        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        return randomMove || ghost;
      })
    );
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isPlaying) return;
    
    switch (e.key) {
      case 'ArrowUp':
        if (maze[pacman.y - 1]?.[pacman.x] !== '#') setDirection('up');
        break;
      case 'ArrowDown':
        if (maze[pacman.y + 1]?.[pacman.x] !== '#') setDirection('down');
        break;
      case 'ArrowLeft':
        if (maze[pacman.y]?.[pacman.x - 1] !== '#') setDirection('left');
        break;
      case 'ArrowRight':
        if (maze[pacman.y]?.[pacman.x + 1] !== '#') setDirection('right');
        break;
    }
  };

  const movePacman = () => {
    let newPos = { ...pacman };
    
    switch (direction) {
      case 'up': newPos.y--; break;
      case 'down': newPos.y++; break;
      case 'left': newPos.x--; break;
      case 'right': newPos.x++; break;
    }

    if (maze[newPos.y]?.[newPos.x] !== '#') {
      setPacman(newPos);
      
      // Collect pellets
      setPellets(prev => prev.filter(p => !(p.x === newPos.x && p.y === newPos.y)));
      
      // Update score
      if (pellets.some(p => p.x === newPos.x && p.y === newPos.y)) {
        setScore(s => s + 10);
      }
    }
  };

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const gameLoop = setInterval(() => {
      movePacman();
      moveGhosts();
      
      // Check collision with ghosts
      if (ghosts.some(g => g.x === pacman.x && g.y === pacman.y)) {
        setGameOver(true);
        setIsPlaying(false);
      }
      
      // Check win condition
      if (pellets.length === 0) {
        setGameOver(true);
        setIsPlaying(false);
      }
    }, 200);

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      clearInterval(gameLoop);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, gameOver, pacman, ghosts, direction, pellets]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, GRID_WIDTH * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);

    // Draw maze
    maze.forEach((row, y) => {
      row.split('').forEach((cell, x) => {
        if (cell === '#') {
          ctx.fillStyle = 'blue';
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      });
    });

    // Draw pellets
    ctx.fillStyle = 'white';
    pellets.forEach(({ x, y }) => {
      ctx.beginPath();
      ctx.arc(x * CELL_SIZE + CELL_SIZE/2, y * CELL_SIZE + CELL_SIZE/2, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Pacman
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(
      pacman.x * CELL_SIZE + CELL_SIZE/2,
      pacman.y * CELL_SIZE + CELL_SIZE/2,
      CELL_SIZE/2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw ghosts
    ghosts.forEach(({ x, y }, i) => {
      ctx.fillStyle = i === 0 ? 'red' : 'pink';
      ctx.beginPath();
      ctx.arc(x * CELL_SIZE + CELL_SIZE/2, y * CELL_SIZE + CELL_SIZE/2, CELL_SIZE/2 - 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [maze, pacman, ghosts, pellets]);

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4 p-4" style={{ width: '450px', height: '450px' }}>
      <div className="flex justify-between w-full">
        <h2 className="text-xl font-bold">Pacman</h2>
        <span className="text-xl">Score: {score}</span>
      </div>
      <canvas
        ref={canvasRef}
        width={GRID_WIDTH * CELL_SIZE}
        height={GRID_HEIGHT * CELL_SIZE}
        className="border border-gray-400"
      />
      {(!isPlaying || gameOver) && (
        <div className="text-center">
          {gameOver && (
            <h3 className="text-xl text-red-500 mb-2">
              {pellets.length === 0 ? 'You Win!' : 'Game Over!'}
            </h3>
          )}
          <Button onClick={initGame}>
            {gameOver ? 'Play Again' : 'Start Game'}
          </Button>
        </div>
      )}
    </div>
  );
}
