export const GRID_COLS = 4
export const GRID_ROWS = 3
export const CHANNELS_PER_PAGE = GRID_COLS * GRID_ROWS

export const COLORS = {
  bg: '#F8F8F8',
  surface: '#FFFFFF',
  accent: '#4EBCFF',
  green: '#4CD964',
  red: '#FF3B30',
  muted: '#999999',
  text: '#333333',
} as const

export const TILE_COLORS = [
  '#4EBCFF', // cyan (default)
  '#FF6B6B', // coral
  '#4CD964', // green
  '#FF9500', // orange
  '#AF52DE', // purple
  '#FF2D55', // pink
  '#5AC8FA', // sky
  '#FFCC00', // yellow
] as const

export const DEFAULT_ICONS = [
  '💻', '🖥️', '⚡', '🚀', '🧟', '💀', '🏠', '🔧',
  '📦', '🎮', '🌐', '🔥', '🐛', '📡', '🤖', '🎯',
] as const

export const SPRING = {
  stiff: { type: 'spring' as const, stiffness: 400, damping: 30 },
  bouncy: { type: 'spring' as const, stiffness: 300, damping: 20 },
  gentle: { type: 'spring' as const, stiffness: 200, damping: 25 },
}

export const WOBBLE_KEYFRAMES = [0, 2, -2, 1, -1, 0]
export const STAGGER_DELAY = 0.04 // 40ms between children
