
import { Card } from '@/components/ui/card';

export function SegaEmulator() {
  return (
    <Card className="h-full p-4">
      <h2 className="text-xl mb-4">Sega Genesis Emulator</h2>
      <div className="text-center text-muted-foreground">
        Drop ROM file to play
      </div>
    </Card>
  );
}
