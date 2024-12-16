
import { useState, useEffect } from 'react';

export function SelectionBox() {
  const [isSelecting, setIsSelecting] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [current, setCurrent] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseUp = () => {
      if (isSelecting) {
        setIsSelecting(false);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isSelecting) {
        setCurrent({ x: e.clientX, y: e.clientY });
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isSelecting, start, current]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start selection on desktop background
    if ((e.target as HTMLElement).className.includes('desktop-background')) {
      setIsSelecting(true);
      setStart({ x: e.clientX, y: e.clientY });
      setCurrent({ x: e.clientX, y: e.clientY });
    }
  };

  if (!isSelecting) return null;

  const style = {
    position: 'fixed' as const,
    left: Math.min(start.x, current.x),
    top: Math.min(start.y, current.y),
    width: Math.abs(current.x - start.x),
    height: Math.abs(current.y - start.y),
    backgroundColor: 'rgba(0, 120, 215, 0.1)',
    border: '1px solid rgba(0, 120, 215, 0.8)',
    pointerEvents: 'none' as const,
    zIndex: 9999,
  };

  return <div style={style} onMouseDown={handleMouseDown} />;
}
