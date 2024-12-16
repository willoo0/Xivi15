import { create } from 'zustand'

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

type DesktopState = {
  windows: AppWindow[]
  activeWindowId: string | null
  maxZIndex: number
  addWindow: (window: Omit<AppWindow, 'zIndex'>) => void
  removeWindow: (id: string) => void
  setActiveWindow: (id: string) => void
  updateWindowPosition: (id: string, position: Partial<WindowPosition>) => void
  toggleMinimize: (id: string) => void
  toggleMaximize: (id: string) => void
}

export const useDesktopStore = create<DesktopState>((set) => ({
  windows: [],
  activeWindowId: null,
  maxZIndex: 0,
  
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
  }))
}))
