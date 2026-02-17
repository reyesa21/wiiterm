import { motion } from 'framer-motion'

interface PageDotsProps {
  total: number
  current: number
  onChange: (page: number) => void
}

export function PageDots({ total, current, onChange }: PageDotsProps) {
  if (total <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 py-3">
      {Array.from({ length: total }, (_, i) => (
        <motion.button
          key={i}
          onClick={() => onChange(i)}
          className={`rounded-full transition-colors ${
            i === current
              ? 'bg-wii-accent w-3 h-3'
              : 'bg-wii-border w-2.5 h-2.5 hover:bg-wii-muted'
          }`}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          layout
        />
      ))}
    </div>
  )
}
