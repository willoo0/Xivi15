import { useState } from "react";
import { Window } from "@/components/desktop/Window";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useDesktopStore } from "@/store/desktop";

export function Welcome() {
  const [showAgain, setShowAgain] = useState(true);
  const { windows, removeWindow } = useDesktopStore();

  const handleClose = () => {
    if (!showAgain) {
      localStorage.setItem("hideWelcome", "true");
    }
    const welcomeWindow = windows.find((w) => w.component === "Welcome");
    if (welcomeWindow) {
      removeWindow(welcomeWindow.id);
    }
  };

  return (
    <div className="p-6 max-w-md space-y-4">
      <h1 className="text-2xl font-bold">👋 Welcome to Xivi Spaces</h1>
      <h2>We are so glad to have you has a beta tester!</h2>
      <h2>Released: Dec 25, 2024</h2>

      <div className="space-y-2 text-muted-foreground">
        <p>Here's some cool stuff you can do:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Click the power icon in the top-left to access system options</li>
          <li>Use the taskbar at the bottom to launch apps</li>
          <li>Drag windows to move them around</li>
          <li>Customize the UI to your liking in settings</li>
          <li>Use the music app to play ad-free tunes!</li>
        </ul>
        <p style={{ color: 'yellow' }}>
          We are aware of a recent File System issue and are working on it! This
          has minimal affection 😊
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="show-again"
          checked={!showAgain}
          onCheckedChange={(checked) => setShowAgain(!checked)}
          style={{ display: 'flex', alignItems: 'center' }}
        />
        <label htmlFor="show-again" className="text-sm">
          Don't show this again
        </label>
      </div>

      <Button className="w-full" onClick={handleClose}>
        Get Started
      </Button>
    </div>
  );
}
