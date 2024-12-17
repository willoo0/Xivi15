
import { Button } from "@/components/ui/button";
import { useDesktopStore } from "@/store/desktop";
import { nanoid } from "nanoid";
import { Gamepad2, Layout, Bomb, Scissors, Hammer } from "lucide-react";

const games = [
  { 
    title: "Tetris", 
    component: "Tetris",
    icon: Layout,
    description: "Classic block-stacking puzzle game"
  },
  { 
    title: "Snake", 
    component: "Snake",
    icon: Scissors,
    description: "Guide the snake to eat and grow, but don't hit the walls!"
  },
  { 
    title: "Minesweeper", 
    component: "Minesweeper",
    icon: Bomb,
    description: "Find all mines without triggering any of them"
  },
  { 
    title: "Whack-a-Mole", 
    component: "WhackAMole",
    icon: Hammer,
    description: "Test your reflexes by whacking moles as they appear"
  },
  { 
    title: "Minecraft", 
    component: "Minecraft",
    icon: Gamepad2,
    description: "Classic browser version of Minecraft"
  },
];

export function Games() {
  const { addWindow } = useDesktopStore();

  const launchGame = (game: typeof games[0]) => {
    addWindow({
      id: nanoid(),
      title: game.title,
      component: game.component,
      position: {
        x: 50 + Math.random() * 100,
        y: 50 + Math.random() * 100,
        width: 600,
        height: 400,
      },
      isMinimized: false,
      isMaximized: false,
    });
  };

  return (
    <div className="p-6 grid grid-cols-2 gap-4">
      <h2 className="text-2xl font-bold col-span-2 flex items-center gap-2">
        <Gamepad2 className="h-6 w-6" />
        Games Hub
      </h2>
      {games.map((game) => {
        const Icon = game.icon;
        return (
          <Button
            key={game.component}
            variant="outline"
            className="h-32 text-lg flex flex-col items-center justify-center gap-2 p-4"
            onClick={() => launchGame(game)}
          >
            <Icon className="h-8 w-8" />
            <span className="font-bold">{game.title}</span>
            <span className="text-xs text-muted-foreground text-center">
              {game.description}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
