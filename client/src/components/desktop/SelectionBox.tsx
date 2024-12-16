
import { useState, useEffect } from 'react';

export function SelectionBox() {
  const [isSelecting, setIsSelecting] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [current, setCurrent] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isSelecting) {
        setCurrent({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      if (isSelecting) {
        setIsSelecting(false);
      }
    };

    if (isSelecting) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSelecting]);

  const startSelection = (e: React.MouseEvent) => {
    if (e.button === 0 && (e.target as HTMLElement).classList.contains('desktop-background')) {
      setIsSelecting(true);
      setStart({ x: e.clientX, y: e.clientY });
      setCurrent({ x: e.clientX, y: e.clientY });
    }
  };

  if (!isSelecting && !start.x && !start.y) return null;

  const style: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(start.x, current.x),
    top: Math.min(start.y, current.y),
    width: Math.abs(current.x - start.x),
    height: Math.abs(current.y - start.y),
    backgroundColor: 'rgba(0, 120, 215, 0.1)',
    border: '1px solid rgba(0, 120, 215, 0.8)',
    pointerEvents: 'none',
    zIndex: 9999,
  };

  return <div style={style} />;
}
