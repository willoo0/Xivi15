
import {
  FileText,
  Calculator,
  Folder,
  Settings,
  Cloud,
  Layout,
  Scissors,
  Bomb,
  Calendar,
  Image,
  Monitor,
  Timer,
  Globe,
  Hammer,
  AppWindow,
  Wave
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
  Paint: Image,
  SystemInfo: Monitor,
  TimerClock: Timer,
  Browser: Globe,
  WhackAMole: Hammer,
  Welcome: Wave,
};

export const getAppIcon = (component: string) => appIcons[component] || AppWindow;
