
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useDesktopStore } from '@/store/desktop'
import { useToast } from '@/hooks/use-toast'
import { useEffect } from 'react'

export function Settings() {
  const { theme, blurEffects, animations, notifications, taskbarMode, updateSettings } = useDesktopStore();
  const { toast } = useToast();

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const prefersDark = mediaQuery.matches;
    const shouldUseDark = theme === 'dark' || (theme === 'system' && prefersDark);
    
    if (shouldUseDark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    const handleChange = () => {
      if (theme === 'system') {
        const newPrefersDark = mediaQuery.matches;
        root.classList.toggle('dark', newPrefersDark);
        root.style.colorScheme = newPrefersDark ? 'dark' : 'light';
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);
  
  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your changes have been applied successfully.",
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Appearance</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <RadioGroup
              value={theme}
              onValueChange={(value) => 
                updateSettings({ theme: value as 'light' | 'dark' | 'system' })
              }
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light">Light</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark">Dark</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system">System</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label>Taskbar Mode</Label>
            <RadioGroup
              value={taskbarMode}
              onValueChange={(value) => 
                updateSettings({ taskbarMode: value as 'normal' | 'chrome' | 'windows11' })
              }
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="normal" />
                <Label htmlFor="normal">Normal (Left-aligned)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="chrome" id="chrome" />
                <Label htmlFor="chrome">Chrome OS style</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="windows11" id="windows11" />
                <Label htmlFor="windows11">Windows 11 style</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Window Opacity</Label>
              <input
                type="range"
                min="50"
                max="100"
                value={(windowOpacity || 80) * 100}
                onChange={(e) => updateSettings({ windowOpacity: Number(e.target.value) / 100 })}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold mb-4">System</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notifications</Label>
              <div className="text-sm text-muted-foreground">
                Show system notifications
              </div>
            </div>
            <Switch 
              checked={notifications}
              onCheckedChange={(checked) => updateSettings({ notifications: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Animations</Label>
              <div className="text-sm text-muted-foreground">
                Enable system animations
              </div>
            </div>
            <Switch 
              checked={animations}
              onCheckedChange={(checked) => updateSettings({ animations: checked })}
            />
          </div>
        </div>
      </div>
      
      <Button className="w-full" onClick={handleSave}>
        Save Changes
      </Button>
    </div>
  );
}
