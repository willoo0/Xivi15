
import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { apps } from '@/lib/apps';
import { useDesktopStore } from '@/store/desktop';
import { getAppIcon } from '@/lib/appIcons';

export function StartMenu() {
  const { showStartMenu, setShowStartMenu, openWindow } = useDesktopStore();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowStartMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowStartMenu]);

  if (!showStartMenu) return null;

  const handleAppClick = (component: string, title: string) => {
    openWindow(component, title);
    setShowStartMenu(false);
  };

  return (
    <Card 
      ref={menuRef}
      className={`fixed bottom-12 w-[420px] h-[450px] p-4 bg-background/80 backdrop-blur-md z-[9000] menu-transition ${
        useDesktopStore().taskbarMode === 'windows11' ? 'left-1/2 -translate-x-1/2' : 'left-2'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="space-y-2">
        {apps.map((app) => {
          const Icon = getAppIcon(app.component);
          return (
            <div
              key={app.component}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/10 cursor-pointer"
              onClick={() => handleAppClick(app.component, app.title)}
            >
              <Icon className="h-6 w-6" />
              <span>{app.title}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
