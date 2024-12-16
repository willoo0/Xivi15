import { Desktop } from './components/Desktop'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { Toaster } from './components/ui/toaster'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Desktop />
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
