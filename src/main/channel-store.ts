import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

const CONFIG_DIR = join(homedir(), '.wii-term')
const CHANNELS_FILE = join(CONFIG_DIR, 'channels.json')

export interface ChannelData {
  id: string
  name: string
  icon: string
  color: string
  type: 'shell' | 'project' | 'ssh'
  order: number
  config: {
    cwd?: string
    shell?: string
    startupCommand?: string
    env?: Record<string, string>
  }
  createdAt: number
}

async function ensureDir(): Promise<void> {
  if (!existsSync(CONFIG_DIR)) {
    await mkdir(CONFIG_DIR, { recursive: true })
  }
}

export async function loadChannels(): Promise<ChannelData[]> {
  await ensureDir()
  if (!existsSync(CHANNELS_FILE)) {
    return []
  }
  try {
    const raw = await readFile(CHANNELS_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function saveChannels(channels: ChannelData[]): Promise<boolean> {
  await ensureDir()
  try {
    await writeFile(CHANNELS_FILE, JSON.stringify(channels, null, 2), 'utf-8')
    return true
  } catch (e) {
    console.error('Failed to save channels:', e)
    return false
  }
}
