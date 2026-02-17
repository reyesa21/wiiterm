import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FolderOpen, Trash2 } from 'lucide-react'
import { useStore } from '@/stores/useStore'
import { Channel } from '@/lib/types'
import { TILE_COLORS, DEFAULT_ICONS } from '@/lib/constants'

export function ChannelEditor() {
  const { showEditor, editingChannel, closeEditor, addChannel, updateChannel, deleteChannel, showToast } = useStore()

  const [name, setName] = useState('')
  const [icon, setIcon] = useState('💻')
  const [color, setColor] = useState(TILE_COLORS[0])
  const [cwd, setCwd] = useState('')
  const [startupCommand, setStartupCommand] = useState('')
  const [showDelete, setShowDelete] = useState(false)

  const isEditing = !!editingChannel

  useEffect(() => {
    if (editingChannel) {
      setName(editingChannel.name)
      setIcon(editingChannel.icon)
      setColor(editingChannel.color)
      setCwd(editingChannel.config.cwd || '')
      setStartupCommand(editingChannel.config.startupCommand || '')
    } else {
      setName('')
      setIcon('💻')
      setColor(TILE_COLORS[0])
      setCwd('')
      setStartupCommand('')
    }
    setShowDelete(false)
  }, [editingChannel, showEditor])

  const handlePickDirectory = async () => {
    const dir = await window.api.selectDirectory()
    if (dir) setCwd(dir)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      showToast('Name is required', 'error')
      return
    }

    if (isEditing && editingChannel) {
      await updateChannel(editingChannel.id, {
        name: name.trim(),
        icon,
        color,
        config: {
          ...editingChannel.config,
          cwd: cwd || undefined,
          startupCommand: startupCommand || undefined,
        }
      })
      showToast('Channel updated', 'success')
    } else {
      const channel: Channel = {
        id: crypto.randomUUID(),
        name: name.trim(),
        icon,
        color,
        type: cwd ? 'project' : 'shell',
        order: useStore.getState().channels.length,
        config: {
          cwd: cwd || undefined,
          startupCommand: startupCommand || undefined,
        },
        createdAt: Date.now(),
      }
      await addChannel(channel)
      showToast('Channel created', 'success')
    }
    closeEditor()
  }

  const handleDelete = async () => {
    if (editingChannel) {
      await deleteChannel(editingChannel.id)
      showToast('Channel deleted', 'info')
      closeEditor()
    }
  }

  return (
    <AnimatePresence>
      {showEditor && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/30 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeEditor}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-wii-surface rounded-wii-lg shadow-wii-hover w-full max-w-md overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-wii-border">
                <h2 className="text-base font-sans font-bold text-wii-text">
                  {isEditing ? 'Edit Channel' : 'New Channel'}
                </h2>
                <button onClick={closeEditor} className="text-wii-muted hover:text-wii-text transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 py-4 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-sans font-semibold text-wii-muted mb-1.5">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. zombie-gacha"
                    className="w-full px-3 py-2 rounded-lg border border-wii-border bg-wii-bg text-sm font-sans
                      focus:outline-none focus:border-wii-accent focus:ring-1 focus:ring-wii-accent/30
                      placeholder:text-wii-muted/50"
                    autoFocus
                  />
                </div>

                {/* Icon picker */}
                <div>
                  <label className="block text-xs font-sans font-semibold text-wii-muted mb-1.5">Icon</label>
                  <div className="flex flex-wrap gap-1.5">
                    {DEFAULT_ICONS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setIcon(emoji)}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all
                          ${icon === emoji
                            ? 'bg-wii-accent/15 ring-2 ring-wii-accent scale-110'
                            : 'bg-wii-bg hover:bg-wii-border'
                          }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color picker */}
                <div>
                  <label className="block text-xs font-sans font-semibold text-wii-muted mb-1.5">Color</label>
                  <div className="flex gap-2">
                    {TILE_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-7 h-7 rounded-full transition-all ${
                          color === c ? 'ring-2 ring-offset-2 ring-wii-text scale-110' : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Working directory */}
                <div>
                  <label className="block text-xs font-sans font-semibold text-wii-muted mb-1.5">Working Directory</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cwd}
                      onChange={e => setCwd(e.target.value)}
                      placeholder="~/projects/my-app"
                      className="flex-1 px-3 py-2 rounded-lg border border-wii-border bg-wii-bg text-sm font-mono
                        focus:outline-none focus:border-wii-accent focus:ring-1 focus:ring-wii-accent/30
                        placeholder:text-wii-muted/50"
                    />
                    <button
                      onClick={handlePickDirectory}
                      className="px-3 py-2 rounded-lg border border-wii-border bg-wii-bg hover:bg-wii-border
                        transition-colors text-wii-muted hover:text-wii-text"
                    >
                      <FolderOpen size={16} />
                    </button>
                  </div>
                </div>

                {/* Startup command */}
                <div>
                  <label className="block text-xs font-sans font-semibold text-wii-muted mb-1.5">Startup Command</label>
                  <input
                    type="text"
                    value={startupCommand}
                    onChange={e => setStartupCommand(e.target.value)}
                    placeholder="e.g. npm run dev"
                    className="w-full px-3 py-2 rounded-lg border border-wii-border bg-wii-bg text-sm font-mono
                      focus:outline-none focus:border-wii-accent focus:ring-1 focus:ring-wii-accent/30
                      placeholder:text-wii-muted/50"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-4 border-t border-wii-border">
                <div>
                  {isEditing && (
                    showDelete ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-wii-red font-sans">Sure?</span>
                        <button
                          onClick={handleDelete}
                          className="text-xs text-wii-red font-sans font-semibold hover:underline"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setShowDelete(false)}
                          className="text-xs text-wii-muted font-sans hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowDelete(true)}
                        className="text-wii-muted hover:text-wii-red transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={closeEditor}
                    className="px-4 py-2 rounded-lg text-sm font-sans font-semibold text-wii-muted
                      hover:bg-wii-bg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 rounded-lg text-sm font-sans font-semibold text-white
                      bg-wii-accent hover:bg-wii-accent-dark transition-colors"
                  >
                    {isEditing ? 'Save' : 'Create'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
