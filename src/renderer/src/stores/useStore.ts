import { create } from 'zustand'
import { Channel, TerminalSession, ViewMode } from '@/lib/types'

interface AppState {
  // Channels
  channels: Channel[]
  loadChannels: () => Promise<void>
  addChannel: (channel: Channel) => Promise<void>
  updateChannel: (id: string, updates: Partial<Channel>) => Promise<void>
  deleteChannel: (id: string) => Promise<void>
  reorderChannels: (channels: Channel[]) => Promise<void>

  // Sessions (runtime only)
  sessions: Map<string, TerminalSession>
  createSession: (channelId: string) => TerminalSession
  markSessionDead: (sessionId: string) => void
  getSession: (channelId: string) => TerminalSession | undefined

  // View
  view: ViewMode
  activeChannelId: string | null
  setView: (view: ViewMode, channelId?: string | null) => void

  // Pagination
  currentPage: number
  setPage: (page: number) => void

  // Channel editor
  editingChannel: Channel | null
  showEditor: boolean
  openEditor: (channel?: Channel) => void
  closeEditor: () => void

  // Toast
  toast: { message: string; type: 'success' | 'error' | 'info' } | null
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
}

export const useStore = create<AppState>((set, get) => ({
  // Channels
  channels: [],
  loadChannels: async () => {
    const channels = await window.api.getChannels()
    set({ channels: channels.sort((a, b) => a.order - b.order) })
  },
  addChannel: async (channel) => {
    const channels = [...get().channels, channel]
    set({ channels })
    await window.api.saveChannels(channels)
  },
  updateChannel: async (id, updates) => {
    const channels = get().channels.map(c =>
      c.id === id ? { ...c, ...updates } : c
    )
    set({ channels })
    await window.api.saveChannels(channels)
  },
  deleteChannel: async (id) => {
    // Kill any active session
    const session = get().sessions.get(id)
    if (session) {
      await window.api.ptyKill(session.id)
      const sessions = new Map(get().sessions)
      sessions.delete(id)
      set({ sessions })
    }
    const channels = get().channels.filter(c => c.id !== id)
    set({ channels })
    await window.api.saveChannels(channels)
  },
  reorderChannels: async (channels) => {
    const reordered = channels.map((c, i) => ({ ...c, order: i }))
    set({ channels: reordered })
    await window.api.saveChannels(reordered)
  },

  // Sessions
  sessions: new Map(),
  createSession: (channelId) => {
    const sessionId = crypto.randomUUID()
    const session: TerminalSession = { id: sessionId, channelId, alive: true }
    const sessions = new Map(get().sessions)
    sessions.set(channelId, session)
    set({ sessions })
    return session
  },
  markSessionDead: (sessionId) => {
    const sessions = new Map(get().sessions)
    for (const [key, session] of sessions) {
      if (session.id === sessionId) {
        sessions.set(key, { ...session, alive: false })
        break
      }
    }
    set({ sessions })
  },
  getSession: (channelId) => {
    return get().sessions.get(channelId)
  },

  // View
  view: 'grid',
  activeChannelId: null,
  setView: (view, channelId) => {
    set({
      view,
      activeChannelId: channelId !== undefined ? channelId : get().activeChannelId
    })
  },

  // Pagination
  currentPage: 0,
  setPage: (page) => set({ currentPage: page }),

  // Editor
  editingChannel: null,
  showEditor: false,
  openEditor: (channel) => set({ editingChannel: channel ?? null, showEditor: true }),
  closeEditor: () => set({ editingChannel: null, showEditor: false }),

  // Toast
  toast: null,
  showToast: (message, type) => {
    set({ toast: { message, type } })
    setTimeout(() => set({ toast: null }), 3000)
  },
}))
