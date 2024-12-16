import { useState, useEffect } from 'react'
import { Desktop } from './components/Desktop'
import { QueryClientProvider } from '@tanstack/react-query'
import { Splash } from './components/Splash'
import { queryClient } from './lib/queryClient'
import { Toaster } from './components/ui/toaster'
import { nanoid } from 'nanoid'
import { useDesktopStore } from './store/desktop'

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const { addWindow, windows } = useDesktopStore();

  useEffect(() => {
    const hideWelcome = localStorage.getItem('hideWelcome');
    const hasWelcomeWindow = windows.some(w => w.component === 'Welcome');
    if (!hideWelcome && !hasWelcomeWindow && !showSplash) {
      addWindow({
        id: nanoid(),
        title: 'Welcome',
        component: 'Welcome',
        position: {
          x: window.innerWidth / 2 - 200,
          y: window.innerHeight / 2 - 200,
          width: 400,
          height: 400
        },
        isMinimized: false,
        isMaximized: false
      });
    }
  }, [addWindow]);

  return (
    <QueryClientProvider client={queryClient}>
      {showSplash ? (
        <Splash onFinish={() => setShowSplash(false)} />
      ) : (
        <Desktop />
      )}
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
