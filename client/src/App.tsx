import { useState } from 'react'
import { Desktop } from './components/Desktop'
import { QueryClientProvider } from '@tanstack/react-query'
import { Splash } from './components/Splash'
import { queryClient } from './lib/queryClient'
import { Toaster } from './components/ui/toaster'

function App() {
  const [showSplash, setShowSplash] = useState(true);

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
