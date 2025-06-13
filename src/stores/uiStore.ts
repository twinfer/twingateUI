import { create } from 'zustand'
import { toast } from 'sonner'

export interface ToastData {
  title: string
  description?: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export interface Modal {
  id: string
  type: 'confirmation' | 'form' | 'info'
  title: string
  content?: React.ReactNode
  onConfirm?: () => void
  onCancel?: () => void
}

export interface UIState {
  // Sidebar
  sidebarCollapsed: boolean
  
  // Loading states
  globalLoading: boolean
  pageLoading: Record<string, boolean>
  
  // Modals
  modals: Modal[]
  
  // Discovery
  discoveryModalOpen: boolean
  
  // Actions
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setGlobalLoading: (loading: boolean) => void
  setPageLoading: (page: string, loading: boolean) => void
  showToast: (toastData: ToastData) => void
  addModal: (modal: Omit<Modal, 'id'>) => void
  removeModal: (id: string) => void
  clearModals: () => void
  setDiscoveryModalOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  sidebarCollapsed: false,
  globalLoading: false,
  pageLoading: {},
  modals: [],
  discoveryModalOpen: false,

  // Actions
  toggleSidebar: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
  },

  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed })
  },

  setGlobalLoading: (globalLoading) => {
    set({ globalLoading })
  },

  setPageLoading: (page, loading) => {
    set((state) => ({
      pageLoading: { ...state.pageLoading, [page]: loading },
    }))
  },

  showToast: (toastData) => {
    const { type, title, description, duration } = toastData
    
    switch (type) {
      case 'success':
        toast.success(title, { description, duration })
        break
      case 'error':
        toast.error(title, { description, duration })
        break
      case 'warning':
        toast.warning(title, { description, duration })
        break
      case 'info':
      default:
        toast.info(title, { description, duration })
        break
    }
  },

  addModal: (modal) => {
    const id = Math.random().toString(36).substr(2, 9)
    set((state) => ({
      modals: [...state.modals, { ...modal, id }],
    }))
  },

  removeModal: (id) => {
    set((state) => ({
      modals: state.modals.filter((modal) => modal.id !== id),
    }))
  },

  clearModals: () => {
    set({ modals: [] })
  },

  setDiscoveryModalOpen: (discoveryModalOpen) => {
    set({ discoveryModalOpen })
  },
}))

// Convenience hooks
export const useToast = () => {
  const { showToast } = useUIStore()
  return { showToast }
}

export const useModal = () => {
  const { addModal, removeModal, modals } = useUIStore()
  return { addModal, removeModal, modals }
}

export const useLoading = () => {
  const { globalLoading, pageLoading, setGlobalLoading, setPageLoading } = useUIStore()
  return { globalLoading, pageLoading, setGlobalLoading, setPageLoading }
}