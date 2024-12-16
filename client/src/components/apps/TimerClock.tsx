
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function TimerClock() {
  // Timer state
  const [seconds, setSeconds] = useState<number>(0);
  const [inputSeconds, setInputSeconds] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(false);

  // Clock state
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds]);

  // Clock effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString());
      setDate(now.toLocaleDateString());
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    const parsedSeconds = parseInt(inputSeconds, 10);
    if (!isNaN(parsedSeconds) && parsedSeconds > 0) {
      setSeconds(parsedSeconds);
      setIsActive(true);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setSeconds(0);
    setInputSeconds('');
  };

  return (
    <div className="p-4">
      <Tabs defaultValue="timer">
        <TabsList className="w-full">
          <TabsTrigger value="timer" className="flex-1">Timer</TabsTrigger>
          <TabsTrigger value="clock" className="flex-1">Clock</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timer" className="space-y-4">
          <Input
            type="number"
            value={inputSeconds}
            onChange={(e) => setInputSeconds(e.target.value)}
            placeholder="Enter seconds"
            disabled={isActive}
          />
          <div className="text-4xl font-bold text-center">
            {seconds} seconds
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={handleStart}
              disabled={isActive || !inputSeconds}
            >
              Start
            </Button>
            <Button
              className="flex-1"
              variant="outline"
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="clock" className="text-center space-y-4">
          <div className="text-4xl font-bold">{time}</div>
          <div className="text-xl text-muted-foreground">{date}</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
