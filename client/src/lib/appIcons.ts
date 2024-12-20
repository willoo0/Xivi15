
import {
  FileText,
  Calculator,
  Folder,
  Gamepad2,
  Settings,
  Cloud,
  Layout,
  Scissors,
  Bomb,
  Calendar,
  Image as ImageIcon,
  Monitor,
  Timer,
  Globe,
  Hammer,
  AppWindow,
  Hand,
  Music
} from 'lucide-react';

export const appIcons: Record<string, any> = {
  TextEditor: FileText,
  Calculator: Calculator,
  FileExplorer: Folder,
  Settings: Settings,
  Weather: Cloud,
  Tetris: Layout,
  Snake: Scissors,
  Minesweeper: Bomb,
  Todo: Calendar,
  Paint: ImageIcon,
  SystemInfo: Monitor,
  TimerClock: Timer,
  Browser: Globe,
  WhackAMole: Hammer,
  Welcome: Hand,
  Minecraft: Gamepad2,
  Games: Gamepad2,
  PDFViewer: FileText,
  PhotoViewer: ImageIcon,
  MusicPlayer: Music,
};

export const getAppIcon = (component: string) => appIcons[component] || AppWindow;
import {
  Gamepad,
  Laptop,
  PlaySquare,
  MonitorPlay,
  Game,
} from 'lucide-react';

// Add to existing appIcons
export const appIcons = {
  ...appIcons,
  NESEmulator: Gamepad,
  SNESEmulator: Gamepad,
  GBAEmulator: Game,
  N64Emulator: Game,
  PSXEmulator: PlaySquare,
  SegaEmulator: MonitorPlay,
  DOSEmulator: Laptop,
};
