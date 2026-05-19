'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ChipOption {
  id: string
  name: string
}

interface ChipsSelectorProps {
  options: ChipOption[]
  selected: string[]
  onSelect: (id: string) => void
  onRemove: (id: string) => void
  placeholder?: string
  color?: 'blue' | 'green' | 'purple' | 'orange'
}

const colorMap = {
  blue: 'bg-blue-500/20 dark:bg-blue-500/30 text-blue-700 dark:text-blue-300',
  green: 'bg-green-500/20 dark:bg-green-500/30 text-green-700 dark:text-green-300',
  purple: 'bg-purple-500/20 dark:bg-purple-500/30 text-purple-700 dark:text-purple-300',
  orange: 'bg-orange-500/20 dark:bg-orange-500/30 text-orange-700 dark:text-orange-300',
}

const transitionProps = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 30,
  mass: 0.5,
}

export function ChipsSelector({
  options,
  selected,
  onSelect,
  onRemove,
  placeholder = 'Selecionar...',
  color = 'blue',
}: ChipsSelectorProps) {
  const colors = colorMap[color]
  const available = options.filter(opt => !selected.includes(opt.id))
  const selectedOptions = selected.map(id => options.find(o => o.id === id)).filter(Boolean) as ChipOption[]

  return (
    <div className="space-y-4">
      {selectedOptions.length > 0 && (
        <motion.div
          className="flex flex-wrap gap-2"
          layout
          transition={transitionProps}
        >
          <AnimatePresence>
            {selectedOptions.map((opt) => (
              <motion.button
                key={opt.id}
                type="button"
                onClick={() => onRemove(opt.id)}
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={transitionProps}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${colors}`}
              >
                <span>{opt.name}</span>
                <motion.div
                  initial={{ scale: 0, marginLeft: 0 }}
                  animate={{ scale: 1, marginLeft: 6 }}
                  exit={{ scale: 0, marginLeft: 0 }}
                  transition={transitionProps}
                >
                  <X className="w-3 h-3" />
                </motion.div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <motion.div
        className="flex flex-wrap gap-2"
        layout
        transition={transitionProps}
      >
        {available.map((opt) => (
          <motion.button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            layout
            initial={false}
            transition={transitionProps}
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-secondary text-secondary-foreground hover:opacity-80 transition-opacity"
          >
            {opt.name}
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}
