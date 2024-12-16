import { useEffect, useState } from 'react'
import { SelectionBox } from './desktop/SelectionBox'
import { TopBar } from './desktop/TopBar'
import { useDesktopStore } from '@/store/desktop'
import { Window } from './desktop/Window'
import { Taskbar } from './desktop/Taskbar'
import { TextEditor } from './apps/TextEditor'
import { Calculator } from './apps/Calculator'
import { FileExplorer } from './apps/FileExplorer'
import { Settings } from './apps/Settings'
import { Browser } from './apps/Browser'

import { Welcome } from './apps/Welcome'
import { TimerClock } from './apps/TimerClock'
import { SystemInfo } from './apps/SystemInfo';
import { Paint } from './apps/Paint';
import { Todo } from './apps/Todo';
import { Minesweeper } from './apps/Minesweeper';
import { Tetris } from './apps/Tetris';
import { Weather } from './apps/Weather';
import { Snake } from './apps/Snake';
import { WhackAMole } from './apps/WhackAMole'; // Added import for WhackAMole


const components: Record<string, React.ComponentType> = {
  TextEditor,
  Calculator,
  FileExplorer,
  Settings,
  Browser,
  Weather,
  Welcome,
  TimerClock,
  SystemInfo,
  Paint,
  Todo,
  Minesweeper,
  Tetris,
  Snake,
  WhackAMole // Added WhackAMole to components
}

// Use background images from public folder
const lightThemeBg = '/light-theme.jpg'
const darkThemeBg = '/dark-theme.jpg'

export function Desktop() {
  const { windows, theme, updateSettings } = useDesktopStore()
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionCurrent, setSelectionCurrent] = useState({ x: 0, y: 0 });

  const startSelection = (e: React.MouseEvent) => {
    if (e.button === 0 && (e.target as HTMLElement).classList.contains('desktop-background')) {
      setIsSelecting(true);
      const coords = { x: e.clientX, y: e.clientY };
      setSelectionStart(coords);
      setSelectionCurrent(coords);
    }
  };
  
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.style.colorScheme = 'dark'
    } else if (theme === 'light') {
      root.classList.remove('dark')
      root.style.colorScheme = 'light'
    }
  }, [theme])

  return (
    <div 
      className="h-screen w-screen overflow-hidden desktop-background"
      onMouseDown={(e) => startSelection(e)}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        backgroundColor: theme === 'dark' ? 'hsl(222.2 84% 4.9%)' : 'hsl(0 0% 100%)',
        backgroundImage: `url(${theme === 'dark' ? '/dark-theme.jpg' : '/light-theme.jpg'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transition: 'background-color 0.3s ease-in-out, background-image 0.3s ease-in-out'
      }}
    >
      {windows.map(window => {
        const Component = components[window.component]
        if (!Component) {
          console.warn(`Component ${window.component} not found`)
          return null
        }
        return (
          <Window key={window.id} {...window}>
            <Component />
          </Window>
        )
      })}
      <TopBar />
      <Taskbar />
      <SelectionBox 
        isSelecting={isSelecting}
        setIsSelecting={setIsSelecting}
        start={selectionStart}
        current={selectionCurrent}
        setCurrent={setSelectionCurrent}
      />
    </div>
  )
}