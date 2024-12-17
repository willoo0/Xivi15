
import { Button } from "@/components/ui/button";
import { useDesktopStore } from "@/store/desktop";
import { nanoid } from "nanoid";
import { Gamepad2 } from "lucide-react";

const games = [
  { title: "Tetris", component: "Tetris" },
  { title: "Snake", component: "Snake" },
  { title: "Minesweeper", component: "Minesweeper" },
  { title: "Whack-a-Mole", component: "WhackAMole" },
  { title: "Minecraft", component: "Minecraft" },
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
        Games
      </h2>
      {games.map((game) => (
        <Button
          key={game.component}
          variant="outline"
          className="h-24 text-lg"
          onClick={() => launchGame(game)}
        >
          {game.title}
        </Button>
      ))}
    </div>
  );
}
