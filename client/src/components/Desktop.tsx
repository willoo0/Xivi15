import { useDesktopStore } from '@/store/desktop'
import { Window } from './desktop/Window'
import { Taskbar } from './desktop/Taskbar'
import { TextEditor } from './apps/TextEditor'
import { Calculator } from './apps/Calculator'
import { FileExplorer } from './apps/FileExplorer'
import { Settings } from './apps/Settings'
import { Browser } from './apps/Browser'

const components: Record<string, React.ComponentType> = {
  TextEditor,
  Calculator,
  FileExplorer,
  Settings,
  Browser,
}

// Create base64 encoded abstract backgrounds
const lightThemeBg = `data:image/svg+xml,${encodeURIComponent(`
<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f0f4ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e0e7ff;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)"/>
  <path d="M0,540 Q480,270 960,540 T1920,540" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.5"/>
  <path d="M0,540 Q480,810 960,540 T1920,540" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.5"/>
</svg>`)}`

const darkThemeBg = `data:image/svg+xml,${encodeURIComponent(`
<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e1b4b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#312e81;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)"/>
  <path d="M0,540 Q480,270 960,540 T1920,540" fill="none" stroke="#312e81" stroke-width="2" opacity="0.3"/>
  <path d="M0,540 Q480,810 960,540 T1920,540" fill="none" stroke="#312e81" stroke-width="2" opacity="0.3"/>
</svg>`)}`

export function Desktop() {
  const { windows, theme } = useDesktopStore()

  return (
    <div 
      className="h-screen w-screen overflow-hidden bg-cover bg-center transition-all duration-300"
      style={{
        backgroundImage: `url(${theme === 'dark' ? darkThemeBg : lightThemeBg})`,
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
      <Taskbar />
    </div>
  )
}
