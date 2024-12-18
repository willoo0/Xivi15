import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useDesktopStore } from "@/store/desktop";
import { ContextMenu } from "./ContextMenu";
import { nanoid } from "nanoid";
import { AppWindow, Cloud, Layout, Bomb, Scissors, Hammer, Calendar, Image, Monitor, Timer, Globe, FileText, Calculator, Folder, Settings, Gamepad2 } from "lucide-react";
import { getAppIcon } from "@/lib/appIcons";

interface StartMenuProps {
  onClose: () => void;
}

const apps = [
  {
    id: "weather",
    title: "Weather",
    component: "Weather",
    icon: Cloud,
    category: "Internet",
  },
  {
    id: "games",
    title: "Games",
    component: "Games",
    icon: Gamepad2,
    category: "Applications",
  },
  {
    id: "todo",
    title: "Todo List",
    component: "Todo",
    icon: Calendar,
    category: "Productivity",
  },
  {
    id: "paint",
    title: "Paint",
    component: "Paint",
    icon: Image,
    category: "Media",
  },
  {
    id: "systeminfo",
    title: "System Info",
    component: "SystemInfo",
    icon: Monitor,
    category: "System",
  },
  {
    id: "timerclock",
    title: "Timer & Clock",
    component: "TimerClock",
    icon: Timer,
    category: "Accessories",
  },
  {
    id: "browser",
    title: "Web Browser",
    component: "Browser",
    icon: Globe,
    category: "Internet",
  },
  {
    id: "text-editor",
    title: "Text Editor",
    component: "TextEditor",
    icon: FileText,
    category: "Productivity",
  },
  {
    id: "calculator",
    title: "Calculator",
    component: "Calculator",
    icon: Calculator,
    category: "Accessories",
  },
  {
    id: "file-explorer",
    title: "Files",
    component: "FileExplorer",
    icon: Folder,
    category: "System",
  },
  {
    id: "settings",
    title: "Settings",
    component: "Settings",
    icon: Settings,
    category: "System",
  },
];

const categories = [
  "Internet",
  "Productivity",
  "Media",
  "System",
  "Accessories",
  "Applications",
];

export function StartMenu({ onClose }: StartMenuProps) {
  const { addWindow } = useDesktopStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    appId: string;
    appComponent: string;
    appTitle: string;
  } | null>(null);

  const filteredApps = apps.filter(app => 
    app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAppClick = (app: (typeof apps)[0]) => {
    addWindow({
      id: nanoid(),
      title: app.title,
      component: app.component,
      position: {
        x: 50 + Math.random() * 100,
        y: 50 + Math.random() * 100,
        width: 600,
        height: 400,
      },
      isMinimized: false,
      isMaximized: false,
    });
    onClose();
  };

  const handleRightClick = (e: React.MouseEvent, app: (typeof apps)[0]) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      appId: "",
      appComponent: app.component,
      appTitle: app.title,
    });
  };

  return (
    <>
      <Card className={`fixed bottom-12 w-[420px] p-4 bg-background/80 backdrop-blur-md z-[9000] menu-transition ${
        useDesktopStore().taskbarMode === 'windows11' ? 'left-1/2 -translate-x-1/2' : 'left-2'
      }`}>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-6">
          {categories.map((category) => {
            const categoryApps = filteredApps.filter(
              (app) => app.category === category,
            );
            if (categoryApps.length === 0) return null;

            return (
              <div key={category} className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground border-b pb-1">
                  {category}
                </h3>
                <div className="grid grid-cols-1 gap-1.5">
                  {categoryApps.map((app) => {
                    const Icon = getAppIcon(app.component);
                    return (
                      <Button
                        key={app.id}
                        variant="ghost"
                        size="sm"
                        className="justify-start h-8 px-2 hover:bg-accent"
                        onClick={() => handleAppClick(app)}
                        onContextMenu={(e) => handleRightClick(e, app)}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        <span className="text-sm">{app.title}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {contextMenu && (
        <ContextMenu {...contextMenu} onClose={() => setContextMenu(null)} />
      )}
    </>
  );
}