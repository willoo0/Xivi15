
import { Button } from "@/components/ui/button";
import { useDesktopStore } from "@/store/desktop";
import { nanoid } from "nanoid";
import { Gamepad2, Layout, Bomb, Scissors, Hammer, Target, Swords, Fish, Castle, Footprints, Snowflake, Shield } from "lucide-react";

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
  { 
    title: "Balloons & Bullets", 
    component: "BalloonsBullets",
    icon: Target,
    description: "Action-packed balloon shooting game"
  },
  { 
    title: "Dodge Brawl", 
    component: "DodgeBrawl",
    icon: Swords,
    description: "Fast-paced dodging and fighting game"
  },
  { 
    title: "Dungeon Fish", 
    component: "DungeonFish",
    icon: Fish,
    description: "Underwater dungeon adventure"
  },
  { 
    title: "Folkware", 
    component: "Folkware",
    icon: Castle,
    description: "Medieval folk adventure game"
  },
  { 
    title: "Silent Heist", 
    component: "SilentHeist",
    icon: Footprints,
    description: "Stealth-based heist game"
  },
  { 
    title: "Snow", 
    component: "Snow",
    icon: Snowflake,
    description: "Winter-themed adventure"
  },
  { 
    title: "Worst Case Scenario", 
    component: "WorstCaseScenario",
    icon: Shield,
    description: "Survive the worst scenarios"
  }
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
        width: 800,
        height: 600,
      },
      isMinimized: false,
      isMaximized: false,
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Gamepad2 className="h-6 w-6" />
        Games Hub
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {games.map((game) => {
          const Icon = game.icon;
          return (
            <Button
              key={game.component}
              variant="outline"
              className="h-[160px] w-full text-lg flex flex-col items-center justify-center gap-3 p-6"
              onClick={() => launchGame(game)}
            >
              <Icon className="h-8 w-8" />
              <span className="font-bold">{game.title}</span>
              <span className="text-xs text-muted-foreground text-center max-w-[180px]">
                {game.description}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
