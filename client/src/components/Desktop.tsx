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

// Use background images from public folder
const lightThemeBg = '/light-theme.jpg'
const darkThemeBg = '/dark-theme.jpg'

export function Desktop() {
  const { windows, theme } = useDesktopStore()

  return (
    <div 
      className="h-screen w-screen overflow-hidden bg-cover bg-center transition-all duration-300"
      style={{
        backgroundImage: `url(${theme === 'dark' ? darkThemeBg : lightThemeBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transition: 'background-image 0.3s ease-in-out'
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
