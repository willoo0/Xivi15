
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function TimerClock() {
  // Timer state
  const [hours, setHours] = useState<string>('');
  const [minutes, setMinutes] = useState<string>('');
  const [seconds, setSeconds] = useState<string>('');
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);

  // Stopwatch state
  const [stopwatchTime, setStopwatchTime] = useState<number>(0);
  const [isStopwatchActive, setIsStopwatchActive] = useState<boolean>(false);

  // Clock state
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && totalSeconds > 0) {
      interval = setInterval(() => {
        setTotalSeconds(prev => prev - 1);
      }, 1000);
    } else if (totalSeconds === 0) {
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, totalSeconds]);

  // Stopwatch effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isStopwatchActive) {
      interval = setInterval(() => {
        setStopwatchTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStopwatchActive]);

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

  const formatTime = (time: number) => {
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = time % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const s = parseInt(seconds) || 0;
    const total = h * 3600 + m * 60 + s;
    if (total > 0) {
      setTotalSeconds(total);
      setIsActive(true);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setTotalSeconds(0);
    setHours('');
    setMinutes('');
    setSeconds('');
  };

  return (
    <div className="p-4">
      <Tabs defaultValue="timer">
        <TabsList className="w-full">
          <TabsTrigger value="timer" className="flex-1">Timer</TabsTrigger>
          <TabsTrigger value="stopwatch" className="flex-1">Stopwatch</TabsTrigger>
          <TabsTrigger value="clock" className="flex-1">Clock</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timer" className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="Hours"
              disabled={isActive}
              min="0"
            />
            <Input
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="Minutes"
              disabled={isActive}
              min="0"
              max="59"
            />
            <Input
              type="number"
              value={seconds}
              onChange={(e) => setSeconds(e.target.value)}
              placeholder="Seconds"
              disabled={isActive}
              min="0"
              max="59"
            />
          </div>
          <div className="text-4xl font-bold text-center">
            {formatTime(totalSeconds)}
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={handleStart}
              disabled={isActive || (!hours && !minutes && !seconds)}
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

        <TabsContent value="stopwatch" className="space-y-4">
          <div className="text-4xl font-bold text-center">
            {formatTime(stopwatchTime)}
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() => setIsStopwatchActive(!isStopwatchActive)}
            >
              {isStopwatchActive ? 'Pause' : 'Start'}
            </Button>
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => {
                setIsStopwatchActive(false);
                setStopwatchTime(0);
              }}
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
