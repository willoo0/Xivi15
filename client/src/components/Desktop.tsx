import { useDesktopStore } from '@/store/desktop'
import { Window } from './desktop/Window'
import { Taskbar } from './desktop/Taskbar'
import { TextEditor } from './apps/TextEditor'
import { Calculator } from './apps/Calculator'
import { FileExplorer } from './apps/FileExplorer'
import { Settings } from './apps/Settings'
import { Browser } from './apps/Browser'

const components = {
  TextEditor,
  Calculator,
  FileExplorer,
  Settings,
  Browser
}

export function Desktop() {
  const { windows } = useDesktopStore()

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 overflow-hidden">
      {windows.map(window => {
        const Component = components[window.component as keyof typeof components]
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
