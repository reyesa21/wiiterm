export interface Channel {
  id: string
  name: string
  icon: string
  color: string
  type: 'shell' | 'project' | 'ssh'
  order: number
  config: ChannelConfig
  createdAt: number
}

export interface ChannelConfig {
  cwd?: string
  shell?: string
  startupCommand?: string
  env?: Record<string, string>
}

export interface TerminalSession {
  id: string
  channelId: string
  alive: boolean
}

export type ViewMode = 'grid' | 'terminal'
