import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type WindowPosition = {
  x: number
  y: number
  width: number
  height: number
}

export type AppWindow = {
  id: string
  title: string
  component: string
  position: WindowPosition
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
}

export type PinnedApp = {
  title: string
  component: string
}

interface DesktopState {
  windows: AppWindow[]
  activeWindowId: string | null
  maxZIndex: number
  pinnedApps: PinnedApp[]
  theme: 'light' | 'dark' | 'system'
  blurEffects: boolean
  animations: boolean
  notifications: boolean
  addWindow: (window: Omit<AppWindow, 'zIndex'>) => void
  removeWindow: (id: string) => void
  setActiveWindow: (id: string) => void
  updateWindowPosition: (id: string, position: Partial<WindowPosition>) => void
  toggleMinimize: (id: string) => void
  toggleMaximize: (id: string) => void
  togglePinApp: (app: PinnedApp) => void
  updateSettings: (settings: Partial<Pick<DesktopState, 'theme' | 'blurEffects' | 'animations' | 'notifications'>>) => void
}

const initialState: Omit<DesktopState, keyof DesktopState> = {
  windows: [],
  activeWindowId: null,
  maxZIndex: 0,
  pinnedApps: [
    { title: 'Files', component: 'FileExplorer' },
    { title: 'Web Browser', component: 'Browser' },
    { title: 'Text Editor', component: 'TextEditor' },
    { title: 'Settings', component: 'Settings' }
  ],
  theme: 'system',
  blurEffects: true,
  animations: true,
  notifications: true,
}

export const useDesktopStore = create<DesktopState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      addWindow: (window) => set((state) => {
        const newZIndex = state.maxZIndex + 1
        return {
          windows: [...state.windows, { ...window, zIndex: newZIndex }],
          activeWindowId: window.id,
          maxZIndex: newZIndex
        }
      }),
      
      removeWindow: (id) => set((state) => ({
        windows: state.windows.filter(w => w.id !== id),
        activeWindowId: state.activeWindowId === id ? null : state.activeWindowId
      })),
      
      setActiveWindow: (id) => set((state) => {
        const newZIndex = state.maxZIndex + 1
        return {
          windows: state.windows.map(w => 
            w.id === id ? { ...w, zIndex: newZIndex } : w
          ),
          activeWindowId: id,
          maxZIndex: newZIndex
        }
      }),
      
      updateWindowPosition: (id, position) => set((state) => ({
        windows: state.windows.map(w =>
          w.id === id ? { ...w, position: { ...w.position, ...position } } : w
        )
      })),
      
      toggleMinimize: (id) => set((state) => ({
        windows: state.windows.map(w =>
          w.id === id ? { ...w, isMinimized: !w.isMinimized } : w
        )
      })),
      
      toggleMaximize: (id) => set((state) => ({
        windows: state.windows.map(w =>
          w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
        )
      })),

      togglePinApp: (app) => set((state) => {
        const isPinned = state.pinnedApps.some(
          pinned => pinned.component === app.component
        )
        return {
          pinnedApps: isPinned
            ? state.pinnedApps.filter(pinned => pinned.component !== app.component)
            : [...state.pinnedApps, app]
        }
      }),

      updateSettings: (settings) => set((state) => ({
        ...state,
        ...settings
      }))
    }),
    {
      name: 'desktop-store',
      version: 1,
      storage: createJSONStorage(() => localStorage)
    }
  )
)
